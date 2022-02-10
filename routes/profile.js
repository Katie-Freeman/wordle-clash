const express = require("express");
const router = express.Router();
const models = require("../models");

let loginUser_id = 13;

//  req.session.user = { userId: user.id, name: name };
// router.get("/", (req, res) => {

//   res.render("profile", { test });
// });

router.get("/", async (req, res, next) => {
  console.log(req.session.user);
  const user = await models.User.findOne({
    where: { id: loginUser_id },
  });
  console.log(user);
  const name = user.dataValues.name;
  const email = user.dataValues.email;
  // console.log(name);

  let soloGames = await models.SoloStat.findAll({
    where: { user_id: loginUser_id },
  });
  // console.log(soloGames);
  console.log("===============");

  // const soloTotal = soloGames.length ? soloGames.length : 0;

  const userProfile = {
    name: name,
    email: email,
    solo: {
      total: {
        all: 0,
        win: 0,
        loss: 0,
        avrg: 0,
      },
      w4: {
        all: 0,
        win: 0,
        loss: 0,
        avrg: 0,
      },
      w5: {
        all: 0,
        win: 0,
        loss: 0,
        avrg: 0,
      },
      w6: {
        all: 0,
        win: 0,
        loss: 0,
        avrg: 0,
      },
      w7: {
        all: 0,
        win: 0,
        loss: 0,
        avrg: 0,
      },
      w8: {
        all: 0,
        win: 0,
        loss: 0,
        avrg: 0,
      },
    },
  };

  soloGames.forEach((e, i) => {
    //total
    userProfile.solo.total.all = i + 1;
    e.win ? (userProfile.solo.total.win += 1) : (userProfile.solo.total.loss += 1);
    userProfile.solo.total.avrg += parseFloat((e.guesses / soloGames.length).toFixed(2)); //toFixed rounds to 0.01 but returns string

    //w4
    e.letterCount == 4 && (userProfile.solo.w4.all += 1);
    e.letterCount == 4 && (e.win ? (userProfile.solo.w4.win += 1) : (userProfile.solo.w4.loss += 1));
    e.letterCount == 4 && (userProfile.solo.w4.avrg += e.guesses); //need to divide later on

    //w5
    e.letterCount == 5 && (userProfile.solo.w5.all += 1);
    e.letterCount == 5 && (e.win ? (userProfile.solo.w5.win += 1) : (userProfile.solo.w5.loss += 1));
    e.letterCount == 5 && (userProfile.solo.w5.avrg += e.guesses); //need to divide later on

    //w6
    e.letterCount == 6 && (userProfile.solo.w6.all += 1);
    e.letterCount == 6 && (e.win ? (userProfile.solo.w6.win += 1) : (userProfile.solo.w6.loss += 1));
    e.letterCount == 6 && (userProfile.solo.w6.avrg += e.guesses); //need to divide later on

    //w7
    e.letterCount == 7 && (userProfile.solo.w7.all += 1);
    e.letterCount == 7 && (e.win ? (userProfile.solo.w7.win += 1) : (userProfile.solo.w7.loss += 1));
    e.letterCount == 7 && (userProfile.solo.w7.avrg += e.guesses); //need to divide later on

    //w8
    e.letterCount == 8 && (userProfile.solo.w8.all += 1);
    e.letterCount == 8 && (e.win ? (userProfile.solo.w8.win += 1) : (userProfile.solo.w8.loss += 1));
    e.letterCount == 8 && (userProfile.solo.w8.avrg += e.guesses); //need to divide later on
  });

  userProfile.solo.w4.avrg != 0 && (userProfile.solo.w4.avrg = parseFloat((userProfile.solo.w4.avrg / userProfile.solo.w4.all).toFixed(2))); //toFixed rounds to 0.01 but returns string
  userProfile.solo.w5.avrg != 0 && (userProfile.solo.w5.avrg = parseFloat((userProfile.solo.w5.avrg / userProfile.solo.w5.all).toFixed(2)));
  userProfile.solo.w6.avrg != 0 && (userProfile.solo.w6.avrg = parseFloat((userProfile.solo.w6.avrg / userProfile.solo.w6.all).toFixed(2)));
  userProfile.solo.w7.avrg != 0 && (userProfile.solo.w7.avrg = parseFloat((userProfile.solo.w7.avrg / userProfile.solo.w7.all).toFixed(2)));
  userProfile.solo.w8.avrg != 0 && (userProfile.solo.w8.avrg = parseFloat((userProfile.solo.w8.avrg / userProfile.solo.w8.all).toFixed(2)));

  console.log(".......................");
  console.log(userProfile);
  res.render("profile", { userProfile });
});

//
module.exports = router;
