const { Router } = require("express");
const profitController = require("./profit.controller");
const authController = require("../auth/auth.controller");

const profitRouter = Router();

profitRouter.post(
  "/add",
  authController.authorize,
  profitController.validateAddProfit,
  profitController.addProfit
);
profitRouter.delete(
  "/:profitId",
  authController.authorize,
  profitController.validateId,
  profitController.deleteProfit
);
profitRouter.get(
  "/date/:profitDate",
  authController.authorize,
  profitController.getProfitByDate
);
profitRouter.get(
  "/month/:profitMonth",
  authController.authorize,
  profitController.getProfitByMonth
);
profitRouter.get(
  "/half-year/:profitMonth",
  authController.authorize,
  profitController.getProfitByHalfYear
);

module.exports = profitRouter;
