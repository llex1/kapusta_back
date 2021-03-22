const { Router } = require('express');
const authController = require('./auth.controller');
const { GoogleAuth, GoogleAuthRedirect } = require('./google/auth.google');
const authRouter = Router();

authRouter.post('/register', authController.registration);
authRouter.post('/login', authController.login);
authRouter.post('/logout', authController.authorize, authController.logout);
authRouter.get('/google', GoogleAuth);
authRouter.get('/google-redirect', GoogleAuthRedirect);


// Відправка на пошту, та підтвердження емейла
// authController.sendMail
// authRouter.get("/confirmed/:verificationToken", authController.confirmationEmail)

module.exports = authRouter;
