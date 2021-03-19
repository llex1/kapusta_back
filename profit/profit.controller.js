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
    await User.findByIdAndUpdate(user._id, {
      $push: {
        profit: newProfit._id,
      },
    });
    res.json(newProfit);
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
    res
      .status(200)
      .send(
        `${deletedProfit.description} за ${deletedProfit.date} был успешно удалён`
      );
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
    for (let i = 0; i < 6; i++) {
      let currentMonth = +profitMonth - i;
      const profitByMonth = await Profit.find({ month: `${currentMonth}` });
      if (profitByMonth[0]) {
        let forMonths = profitByMonth.reduce((acc, el) => acc + el.sum, 0);
        array.push({
          month: moment(`${profitByMonth[0].date}`).format("MMMM"),
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
