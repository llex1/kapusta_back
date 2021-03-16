const {
  Types: { ObjectId },
} = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sgMail = require("@sendgrid/mail");
const { v4: uuidv4 } = require("uuid");
const User = require("./User");
const Token = require("./Token");
sgMail.setApiKey(process.env.EMAIL_TOKEN);

class AuthController {
  async registration(req, res, next) {
    try {
      const { email, password } = req.body;
      const userToken = uuidv4();
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        email: email,
        password: hashedPassword,
        verificationToken: userToken,
        balance: 0,
      });
      const userId = await User.findOne({ email: email });
      const token = jwt.sign({ userId: userId._id }, process.env.TOKEN_SECRET);
      const tokens = await Token.create({
        token: token,
      });
      const updUser = await User.findByIdAndUpdate(userId._id, { tokenid: tokens._id });
      res.status(201).json({
        jwt: token,
        // user: email,  в роздумі
      });
      next();
    } catch (error) {
      res.status(409).send("Email in use");
      console.log(error.message);
    }
  }
  validationUser(req, res, next) {
    const validationRules = Joi.object({
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .required(),
      password: Joi.string().required(),
    });
    const validationResult = validationRules.validate(req.body);
    if (validationResult.error) {
      return res.status(400).send(validationResult.error.message);
    }
    next();
  }
  async sendMail(req, res) {
    const { email } = req.body;
    const user = await User.findOne({ email });
    try {
      const msg = {
        to: email,
        from: "kapustacorporation@gmail.com",
        subject: "Please verify your account",
        html: `Welcome to our application! To verify your account please go by <a href="http://localhost:8080/auth/confirmed/${user.verificationToken}">link</a>`,
      };

      await sgMail.send(msg);
    } catch (error) {
      console.log(error.message, 1);
    }
  }
  async confirmationEmail(req, res) {
    const {
      params: { verificationToken },
    } = req;
    const user = await User.findOne({
      verificationToken,
    });
    if (!user) {
      return res.status(404).sendFile(__dirname + "/confirmation/unsuccessful.html");
    }
    const conectUser = await User.findByIdAndUpdate(user._id, {
      verificationToken: "",
    });
    return res.status(200).sendFile(__dirname + "/confirmation/successfully.html");
  }

  async login(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({
      email,
    });
    if (!user) {
      return res.status(401).send("Email or password is wrong");
    }
    const paswordValid = await bcrypt.compare(password, user.password);
    if (!paswordValid) {
      return res.status(401).send("Email or password is wrong");
    }
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.TOKEN_SECRET
    );
    const tokens = await Token.create({
      token: token,
    });
    await User.findByIdAndUpdate(user._id, {
      $push: {
        tokenid: tokens._id,
      },
    });

    return res.status(200).json({
      // user: user.email,  Запоминаєм на фронті
      jwt: token,
      costs: user.costs,
      profit: user.profit,
    });
  }
  async authorize(req, res, next) {
    const authorizationHeader = req.get("Authorization");
    if (!authorizationHeader) {
      return res.status(401).send({
        message: "Not authorized",
      });
    }
    const userToken = authorizationHeader.replace("Bearer ", "");
    try {
      const payload = await jwt.verify(userToken, process.env.TOKEN_SECRET);
      const { userId } = payload;
      const user = await User.findById(userId);
      const requestedToken = await Token.findOne({
        token: userToken,
      });
      // console.log("requestedToken", requestedToken._id);
      if (!user) {
        return res.status(401).send({
          message: "Not authorized",
        });
      }
      req.user = user;
      req.tokenId = requestedToken._id;
      next();
    } catch (error) {
      return res.status(401).send(error.message);
    }
  }
  async logout(req, res) {
    try {
      const { _id } = req.user;
      await Token.deleteOne({ _id: req.tokenId });
      await User.findByIdAndUpdate(_id, { $pull: { tokenid: req.tokenId } });
      return res.status(200).send({
        message: "User logged out",
      });
    } catch (error) {
      return res.status(401).send({
        message: "Not authorized",
      });
    }
  }
}

module.exports = new AuthController();
