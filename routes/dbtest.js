const express = require("express");
const router = express.Router();
const app = express();
const models = require("../models");

router.get("/", (req, res) => {
  res.render("dbtest");
});

router.post("/adduser", (req, res) => {
  const name = req.body.testDbUser;
  const email = req.body.testDbEmail;
  const pass = req.body.testDbPass;

  user = models.User.build({
    name: name,
    email: email,
    password: pass,
  });
  user.save().then((savedUser) => {
    console.log(savedUser);
    res.redirect("/dbtest");
  });
});

router.post("/game-multi", async (req, res, next) => {
  const name1 = parseInt(req.body.testDbGameUser1);
  const attempts1 = parseInt(req.body.testDbGameAttemptsUser1);
  const win = req.body.testDbWin;
  const name2 = parseInt(req.body.testDbGameUser2);
  const attempts2 = parseInt(req.body.testDbGameAttemptsUser2);
  const NumberOfWords = parseInt(req.body.NumberOfWords);

  console.log(name1);
  console.log(attempts1);
  console.log(win);
  console.log(name2);
  console.log(attempts2);
  console.log(NumberOfWords);

  console.log(req.body);

  let MuchStats = models.MatchStat.build({
    users: [
      { userId: name1, guessCount: attempts1 },
      { userId: name2, guessCount: attempts2 },
    ],
    winner: win,
    letterCount: NumberOfWords,
  });

  let Much = await MuchStats.save();

  console.log("_________________________");
  console.log(Much);

  res.redirect("/dbtest");
});

router.post("/game-single", async (req, res, next) => {
  const user_id = req.body.testDbGameUser;
  const attempts = parseInt(req.body.testDbGameAttemptsUser);
  const win = !!req.body.testDbWon;
  const NumberOfWords = parseInt(req.body.NumberOfWords);

  console.log(user_id);
  console.log(attempts);
  console.log(win);
  console.log(NumberOfWords);

  let gameUser = models.SoloStat.build({
    user_id: user_id,
    win: win,
    letterCount: NumberOfWords,
    guesses: attempts,
  });

  let user = await gameUser.save();

  console.log("+++++++++++++++++++++");
  console.log(user);

  res.redirect("/dbtest");
});

console.log("test");
module.exports = router;
