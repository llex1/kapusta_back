const { Router } = require("express");
const authController = require("./auth.controller");
const logger = require("morgan");
const {GoogleAuth,GoogleAuthRedirect} = require("./google/auth.google")
const authRouter = Router();

authRouter.use(logger("dev"));

authRouter.post("/register", authController.registration);
authRouter.post("/login", authController.login);
authRouter.post('/logout', authController.authorize, authController.logout);
authRouter.get("/google", GoogleAuth);
authRouter.get("/google-redirect", GoogleAuthRedirect);
// authRouter.post("/register", authController.validationUser,authController.registration);


// Відправка на пошту, та підтвердження емейла
// authController.sendMail
// authRouter.get("/confirmed/:verificationToken", authController.confirmationEmail)

module.exports = authRouter;
