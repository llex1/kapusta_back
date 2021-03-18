const { Router } = require("express");
const authController = require("../auth/auth.controller");
const reportController=require("./report.controller")


const reportRouter = Router();


reportRouter.get(
  "/cost/:Month",
  authController.authorize,
  reportController.getReport
);

module.exports = reportRouter;