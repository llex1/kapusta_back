const {
  Types: { ObjectId },
} = require("mongoose");
const Cost = require("./Cost");
const User = require("../auth/User");
const Joi = require("joi");
const moment = require("moment");
require("moment/locale/ru");

async function addCosts(req, res) {
  try {
    const { body, user } = req;
    const newCosts = await Cost.create({
      date: body.date,
      month: body.month,
      description: body.description,
      category: body.category,
      sum: body.sum,
      userId: user._id,
    });
    await User.findByIdAndUpdate(user._id, {
      $push: {
        costs: newCosts._id,
      },
    });
    res.json(newCosts);
  } catch (error) {
    res.status(400).send(error.message);
  }
}

function validateAddCosts(req, res, next) {
  const validationRules = Joi.object({
    date: Joi.string().required(),
    month: Joi.number().required(),
    description: Joi.string().required(),
    category: Joi.string().required(),
    sum: Joi.number().required(),
  });

  const validationResult = validationRules.validate(req.body);

  if (validationResult.error) {
    return res.status(400).send(validationResult.error);
  }
  next();
}

async function deleteCosts(req, res) {
  try {
    const {
      params: { costsId },
    } = req;
    const deletedCosts = await Cost.findByIdAndDelete(costsId);
    if (!deletedCosts) {
      return res.status(400).send("Расход не найден");
    }
    res.status(200).send(`${deletedCosts.description} был успешно удалён`);
  } catch (error) {
    res.status(400).send(error.message);
  }
}

function validateId(req, res, next) {
  const {
    params: { costsId },
  } = req;

  if (!ObjectId.isValid(costsId)) res.status(400).send("Your id is not valid");
  next();
}

async function getCostsByDate(req, res) {
  try {
    const {
      params: { costDate },
    } = req;

    const costsByDate = await Cost.find({ date: costDate });
    res.json(costsByDate);
  } catch (error) {
    res.status(400).send(error);
  }
}
async function getCostsByMonth(req, res) {
  try {
    const {
      params: { costMonth },
    } = req;
    const costsByMonth = await Cost.find({ month: costMonth });
    res.json(costsByMonth);
  } catch (error) {
    res.status(400).send(error);
  }
}
async function getCostsByHalfYear(req, res) {
  try {
    const {
      params: { costMonth },
      user: { _id },
    } = req;
    let array = [];
    const costsByMonth = await Cost.find({ userId: _id });
    for (let i = 0; i < 6; i++) {
      let currentMonth = costMonth - i;
      let date;
      let forMonths = costsByMonth.reduce((acc, el) => {
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
  addCosts,
  validateAddCosts,
  validateId,
  deleteCosts,
  getCostsByDate,
  getCostsByMonth,
  getCostsByHalfYear,
};
