const {
  Types: { ObjectId },
} = require("mongoose");
const Profit = require("./Profit");
const User = require("../auth/User");
const Joi = require("joi");
const moment = require("moment");
require("moment/locale/ru");

async function addProfit(req, res) {
  try {
    const { body, user } = req;
    const newProfit = await Profit.create({
      date: body.date,
      month: body.month,
      description: body.description,
      category: body.category,
      sum: body.sum,
      userId: user._id,
    });
    const updateUser = await User.findByIdAndUpdate(
      user._id,
      {
        balance: user.balance + body.sum,
        $push: {
          profit: newProfit._id,
        },
      },
      { new: true }
    );
    const response = {
      profits: newProfit,
      balance: updateUser.balance,
    };
    res.json(response);
  } catch (error) {
    res.status(400).send(error.message);
  }
}

function validateAddProfit(req, res, next) {
  const validationRules = Joi.object({
    date: Joi.string().required(),
    month: Joi.number().required(),
    description: Joi.string().required(),
    category: Joi.string().required(),
    sum: Joi.number().required(),
    userId: Joi.string(),
  });

  const validationResult = validationRules.validate(req.body);

  if (validationResult.error) {
    return res.status(400).send(validationResult.error);
  }
  next();
}

async function deleteProfit(req, res) {
  try {
    const {
      params: { profitId },
    } = req;
    const deletedProfit = await Profit.findByIdAndDelete(profitId);
    if (!deletedProfit) {
      return res.status(400).send("Доход не найден");
    }
    const updateUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        balance: req.user.balance - deletedProfit.sum,
      },
      { new: true }
    );
    res.status(200).json({ balance: updateUser.balance });
  } catch (error) {
    res.status(400).send(error.message);
  }
}

function validateId(req, res, next) {
  const {
    params: { profitId },
  } = req;

  if (!ObjectId.isValid(profitId)) res.status(400).send("Your id is not valid");
  next();
}

async function getProfitByDate(req, res) {
  try {
    const {
      params: { profitDate },
      user: { _id },
    } = req;

    const profitByDate = await Profit.find({ userId: _id, date: profitDate });
    res.json(profitByDate);
  } catch (error) {
    res.status(400).send(error);
  }
}
async function getProfitByMonth(req, res) {
  try {
    const {
      params: { profitMonth },
      user: { _id },
    } = req;
    const profitByMonth = await Profit.find({
      userId: _id,
      month: profitMonth,
    });
    res.json(profitByMonth);
  } catch (error) {
    res.status(400).send(error);
  }
}
async function getProfitByHalfYear(req, res) {
  try {
    const {
      params: { profitMonth },
    } = req;
    let array = [];
    const profitByMonth = await Profit.find({ userId: _id });
    for (let i = 0; i < 6; i++) {
      let currentMonth = profitMonth - i;
      let date;
      let forMonths = profitByMonth.reduce((acc, el) => {
        if (currentMonth === el.month) {
          date = moment(`${el.date}`).format("MMMM");
          return acc + el.sum;
        } else {
          return acc;
        }
      }, 0);
      if (forMonths > 0) {
        array.push({
          month: date,
          sum: forMonths,
        });
      }
    }
    res.json(array);
  } catch (error) {
    res.status(400).send(error);
  }
}

module.exports = {
  addProfit,
  validateAddProfit,
  validateId,
  deleteProfit,
  getProfitByDate,
  getProfitByMonth,
  getProfitByHalfYear,
};
