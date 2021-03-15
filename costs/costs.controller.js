const Cost = require("./Cost");
const User = require("../auth/User");
const Joi = require("joi");

async function addCosts(req, res) {
  try {
    const { body, user } = req;
    const newCosts = await Cost.create({
      date: body.date,
      description: body.description,
      category: body.category,
      sum: body.sum,
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
    date: Joi.number().required(),
    description: Joi.string().required(),
    category: Joi.string().required(),
    sum: Joi.number().required(),
  });

  const validationResult = validationRules.validate(req.body);
  console.log("validationResult", validationResult);
  if (validationResult.error) {
    return res.status(400).send(validationResult.error);
  }

  next();
}
module.exports = { addCosts, validateAddCosts };
