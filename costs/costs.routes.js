const { Router } = require("express");
const costsController = require("./costs.controller");
const authController = require("../auth/auth.controller");

const costsRouter = Router();

costsRouter.post(
  "/add",
  authController.authorize,
  costsController.validateAddCosts,
  costsController.addCosts
);

module.exports = costsRouter;
