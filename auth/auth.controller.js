class AuthController {
  registration(req, res, next) {
    res.status("200").send("oK_");
const {
  Types: { ObjectId },
} = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sgMail = require("@sendgrid/mail");
const { v4: uuidv4 } = require("uuid");
const User = require("./modelsUsers");
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
      const user = await User.create({
        email: email,
        password: hashedPassword,
        token: token,
        verificationToken: userToken,
      });
      res.status(201).json({
        email: email,
        token: token,
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
}

module.exports = new AuthController();
