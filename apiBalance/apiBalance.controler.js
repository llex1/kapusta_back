const User = require("../auth/User");

class ApiBalanceController {
  status(req, res) {
    try {
      const { balance } = req.user;
      return res.status(200).send({ balance: balance });
    } catch (error) {
      return res.status(400).send({ message: error.message });
    }
  }

  async change(req, res) {
    try {
      const { balance } = req.body;
      if (balance >= 0) {
         const updateUser=await User.findByIdAndUpdate(req.user._id, {balance:balance})
        return res.status(200).send({ balance: balance });
      } else {
        return res.status(400).send({ message: "not valid"});
      }
    } catch (error) {
      return res.status(400).send({ message: error.message });
    }
  }
}

module.exports = new ApiBalanceController();
