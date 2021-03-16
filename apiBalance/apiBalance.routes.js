const { Router } = require("express");
const apiBalanceControler=require("./apiBalance.controler")
const auth=require("../auth/auth.controller")

const apiBalanceRouter = Router();

apiBalanceRouter.get("",auth.authorize, apiBalanceControler.status);
apiBalanceRouter.patch("", auth.authorize, apiBalanceControler.change);

module.exports = apiBalanceRouter;