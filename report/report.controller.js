const {
  Types: { ObjectId },
} = require("mongoose");
const Cost = require("../costs/Cost");
// const Profit=require("../profit/Profit")

async function getReport(req, res) {
  const {
    params: { Month },
    user: { _id },
  } = req;
  let data = {
    costs: 0,
    profit: 0,
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
  const cost = await Cost.find({ userId: _id });
  cost.map((el) => {
    if (el.month === +Month) {
      data.costs += el.sum;
      data.category[el.category] += el.sum;
      if (data.details[el.category][el.description]) {
        console.log(1);
        data.details[el.category][el.description] += el.sum;
      } else {
        data.details[el.category][el.description] = el.sum;
      }
    }
  });
  // const profit = await Profit.find({userId:req.user._id})
  // profit.map(el=>{
  //   if(el.month===+Month){
  //     data.profit+=el.sum
  //   }
  // })
  res.json({
    summary: {
      costs: data.costs,
      profit: data.profit,
    },
    category: data.category,
    details:  data.details
  });
}

module.exports = { getReport };

//?GET kapusta.fun/api/report/costs/?month=число
//* {
//*   summary: {
//*               costs: число
//*               profit:  число
//*             }
//*   category: [
//*              { "продукти": 5000}
//*              { "алкоголь": 200}
//*              { "развлечение": 3400}
//*                и т.д. ....
//*             ]
//*   details:  [
//*                 ДЕТАЛІ ПО "ПРОДУКТАХ" (ЗА УМОВЧЕННЯМ)
//*                 ВІДСОРТОВАНИЙ НА ЗМЕНШЕННЯ
//*               { "свинина": 980}
//*               { "говядина": 500}
//*               { "курица": 230}
//*                и т.д. ....
//*             ]
//?GET kapusta.fun/api/report/costs/?month=число&category=рядок
//*   details:  [
//*                 ДЕТАЛІ ПО ВКАЗАНІЙ КАТЕГОРІЇ
//*                 ВІДСОРТОВАНИЙ НА ЗМЕНШЕННЯ
//*               { "свинина": 980}
//*               { "говядина": 500}
//*               { "курица": 230}
//*                и т.д. ....
//*             ]
//!<---{message: "error message"}
