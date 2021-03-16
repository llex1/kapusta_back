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
costsRouter.delete(
  "/:costsId",
  authController.authorize,
  costsController.validateId,
  costsController.deleteCosts
);
costsRouter.get(
  "/date/:costDate",
  authController.authorize,
  costsController.getCostsByDate
);
costsRouter.get(
  "/month/:costMonth",
  authController.authorize,
  costsController.getCostsByMonth
);

module.exports = costsRouter;
