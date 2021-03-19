const {
  Types: { ObjectId },
} = require("mongoose");
const Cost = require("../costs/Cost");
const Profit=require("../profit/Profit")

async function getReport(req, res) {
  const {
    params: { Month },
    user: { _id },
  } = req;

  const cost = await Cost.find({ userId: _id });
 const costData= costsSum(cost,Month)
 const profit = await Profit.find({ userId: _id });
 const profitData= profitSum(profit,Month)

  res.json({
    summary: {
      costs: costData.costs,
      profit: profitData.profit,
    },
    categoryСosts: costData.category,
    detailsСosts:  costData.details,
    categoryProfit: profitData.category,
    detailsProfit:  profitData.details,
  });
}
function costsSum(array, month) {
  let data = {
    costs: 0,
      category: {
      Транспорт: 0,
      Продукты: 0,
      Здоровье: 0,
      Алкоголь: 0,
      Развлечения: 0,
      "Всё для дома": 0,
      Техника: 0,
      "Коммуналка, связь": 0,
      "Спорт, хобби": 0,
      Образование: 0,
      Прочее: 0,
    },
    details: {
      Транспорт: {},
      Продукты: {},
      Здоровье: {},
      Алкоголь: {},
      Развлечения: {},
      "Всё для дома": {},
      Техника: {},
      "Коммуналка, связь": {},
      "Спорт, хобби": {},
      Образование: {},
      Прочее: {},
    },
  };
  array.map((el) => {
    if (el.month === +month) {
      data.costs += el.sum;
      data.category[el.category] += el.sum;
      if (data.details[el.category][el.description]) {
         data.details[el.category][el.description] += el.sum;
      } else {
        data.details[el.category][el.description] = el.sum;
      }
    }
  });
return  data
}
function profitSum(array, month) {
    let data = {
    profit: 0,
    category: {
      ЗП:0,
      "Доп. доход":0,
    },
    details:{
      ЗП:{},
      "Доп. доход":{}
    }
  }
  array.map((el) => {
    if (el.month === +month) {
      data.profit += el.sum;
      data.category[el.category] += el.sum;
      if (data.details[el.category][el.description]) {
         data.details[el.category][el.description] += el.sum;
      } else {
        data.details[el.category][el.description] = el.sum;
      }
    }
  });
return data
}

module.exports = { getReport };
