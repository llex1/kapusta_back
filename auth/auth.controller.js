const {
  Types: { ObjectId },
} = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sgMail = require("@sendgrid/mail");
const { v4: uuidv4 } = require("uuid");
const User = require("./User");
const Token=require("./Token")
sgMail.setApiKey(process.env.EMAIL_TOKEN);

class AuthController {
  async registration(req, res, next) {
    try {
      const userToken = uuidv4();
      const { email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const token = jwt.sign(
        {
          userId: password,
        },
        process.env.TOKEN_SECRET
      );
      const tokens= await Token.create({
        token: token,
      })

      const user = await User.create({
        email: email,
        password: hashedPassword,

        tokenid: tokens._id,
        verificationToken: userToken,
      });
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
      return res
        .status(404)
        .sendFile(__dirname + "/confirmation/unsuccessful.html", __dirname + "/confirmation/unsuccessful.css");
    }
    const conectUser = await User.findByIdAndUpdate(user._id, { verificationToken: "" });
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
    const tokens= await Token.create({
        token: token,
      })
    await User.findByIdAndUpdate(user._id, {  $push: {
      tokenid: tokens._id,
    }, });

    return res.status(200).json({
      // user: user.email,  Запоминаєм на фронті
      jwt: token,
      costs: user.costs,
      profit: user.profit,
    });
  }
}

module.exports = new AuthController();