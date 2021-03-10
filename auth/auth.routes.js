const { Router } = require("express");
const authController = require("./auth.controller");

const authRouter = Router();

authRouter.post("/register", authController.registration);

module.exports = authRouter;
