const { Router } = require("express");
const authController = require("./auth.controller");
const logger = require("morgan");

const authRouter = Router();

authRouter.use(logger("dev"));

authRouter.post("/register", authController.validationUser,authController.registration);


// Відправка на пошту, та підтвердження емейла
// authController.sendMail
// authRouter.get("/confirmed/:verificationToken", authController.confirmationEmail)

module.exports = authRouter;
