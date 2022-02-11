const express = require("express");
const router = express.Router();
const models = require("../models");
const { Op } = require("sequelize");
const autheniticateMiddleware = require("../middleware/authenticateMiddleware");


router.get("/", autheniticateMiddleware, async (req, res, next) => {
  const loginUser_id = req.session.user.userId;

  const user = await models.User.findOne({
    where: { id: loginUser_id },
  });

  const name = user.dataValues.name;
  const email = user.dataValues.email;

  const soloGames = await models.SoloStat.findAll({
    where: { user_id: loginUser_id },
  });

  const multiGames = await models.MatchStat.findAll({
    where: {
      [Op.or]: [{ "users.0.userId": loginUser_id }, { "users.1.userId": loginUser_id }],
    },
  });

  

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

    multi: {
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
    userProfile.solo.total.avrg += e.guesses;

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

  userProfile.solo.total.avrg != 0 &&
      (userProfile.solo.total.avrg = parseFloat(
          (userProfile.solo.total.avrg / userProfile.solo.total.all).toFixed(2)
      ));
  userProfile.solo.w4.avrg != 0 && (userProfile.solo.w4.avrg = parseFloat((userProfile.solo.w4.avrg / userProfile.solo.w4.all).toFixed(2))); //toFixed rounds to 0.01 but returns string
  userProfile.solo.w5.avrg != 0 && (userProfile.solo.w5.avrg = parseFloat((userProfile.solo.w5.avrg / userProfile.solo.w5.all).toFixed(2)));
  userProfile.solo.w6.avrg != 0 && (userProfile.solo.w6.avrg = parseFloat((userProfile.solo.w6.avrg / userProfile.solo.w6.all).toFixed(2)));
  userProfile.solo.w7.avrg != 0 && (userProfile.solo.w7.avrg = parseFloat((userProfile.solo.w7.avrg / userProfile.solo.w7.all).toFixed(2)));
  userProfile.solo.w8.avrg != 0 && (userProfile.solo.w8.avrg = parseFloat((userProfile.solo.w8.avrg / userProfile.solo.w8.all).toFixed(2)));

  

  multiGames.forEach((e, i) => {
    userProfile.multi.total.all = i + 1;
    e.winner == loginUser_id ? (userProfile.multi.total.win += 1) : (userProfile.multi.total.loss += 1);

    //total guesses all game
    e.users.forEach((u) => {
      u.userId == loginUser_id && (userProfile.multi.total.avrg += u.guessCount); //not average yet -> need to divide by total games
    });

    //total guesses w4
    e.letterCount == 4 &&
      e.users.forEach((u) => {
        u.userId == loginUser_id && (userProfile.multi.w4.avrg += u.guessCount); //not average yet -> need to divide by total games
      });
    //total guesses w5
    e.letterCount == 5 &&
      e.users.forEach((u) => {
        u.userId == loginUser_id && (userProfile.multi.w5.avrg += u.guessCount); //not average yet -> need to divide by total games
      });
    //total guesses w6
    e.letterCount == 6 &&
      e.users.forEach((u) => {
        u.userId == loginUser_id && (userProfile.multi.w6.avrg += u.guessCount); //not average yet -> need to divide by total games
      });
    //total guesses w7
    e.letterCount == 7 &&
      e.users.forEach((u) => {
        u.userId == loginUser_id && (userProfile.multi.w7.avrg += u.guessCount); //not average yet -> need to divide by total games
      });
    //total guesses w8
    e.letterCount == 8 &&
      e.users.forEach((u) => {
        u.userId == loginUser_id && (userProfile.multi.w8.avrg += u.guessCount); //total -> need to divide by total games
      });

    e.letterCount == 4 && (userProfile.multi.w4.all += 1);
    e.letterCount == 5 && (userProfile.multi.w5.all += 1);
    e.letterCount == 6 && (userProfile.multi.w6.all += 1);
    e.letterCount == 7 && (userProfile.multi.w7.all += 1);
    e.letterCount == 8 && (userProfile.multi.w8.all += 1);

    (e.letterCount == 4) & (e.winner == loginUser_id) && (userProfile.multi.w4.win += 1);
    (e.letterCount == 4) & (e.winner != loginUser_id) && (userProfile.multi.w4.loss += 1);
    (e.letterCount == 5) & (e.winner == loginUser_id) && (userProfile.multi.w5.win += 1);
    (e.letterCount == 5) & (e.winner != loginUser_id) && (userProfile.multi.w5.loss += 1);

    (e.letterCount == 6) & (e.winner == loginUser_id) && (userProfile.multi.w6.win += 1);
    (e.letterCount == 6) & (e.winner != loginUser_id) && (userProfile.multi.w6.loss += 1);

    (e.letterCount == 7) & (e.winner == loginUser_id) && (userProfile.multi.w7.win += 1);
    (e.letterCount == 7) & (e.winner != loginUser_id) && (userProfile.multi.w7.loss += 1);

    (e.letterCount == 8) & (e.winner == loginUser_id) && (userProfile.multi.w8.win += 1);
    (e.letterCount == 8) & (e.winner != loginUser_id) && (userProfile.multi.w8.loss += 1);

  
  });
  //calc averages:
  userProfile.multi.total.avrg != 0 && (userProfile.multi.total.avrg = parseFloat((userProfile.multi.total.avrg / userProfile.multi.total.all).toFixed(2)));
  userProfile.multi.w4.avrg != 0 && (userProfile.multi.w4.avrg = parseFloat((userProfile.multi.w4.avrg / userProfile.multi.w4.all).toFixed(2)));
  userProfile.multi.w5.avrg != 0 && (userProfile.multi.w5.avrg = parseFloat((userProfile.multi.w5.avrg / userProfile.multi.w5.all).toFixed(2)));
  userProfile.multi.w6.avrg != 0 && (userProfile.multi.w6.avrg = parseFloat((userProfile.multi.w6.avrg / userProfile.multi.w6.all).toFixed(2)));
  userProfile.multi.w7.avrg != 0 && (userProfile.multi.w7.avrg = parseFloat((userProfile.multi.w7.avrg / userProfile.multi.w7.all).toFixed(2)));
  userProfile.multi.w8.avrg != 0 && (userProfile.multi.w8.avrg = parseFloat((userProfile.multi.w8.avrg / userProfile.multi.w8.all).toFixed(2)));


  res.render("profile", { userProfile });
});

//
module.exports = router;
