const express = require("express");
const router = express.Router();
const app = express();
const models = require("../models");

router.get("/", (req, res) => {
  res.render("dbtest");
});
// forcing dif

router.post("/", (req, res) => {
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

router.post("/game", async (req, res, next) => {
  const name1 = req.body.testDbGameUser1;
  const attempts1 = parseInt(req.body.testDbGameAttemptsUser1);
  const won1 = !!req.body.testDbWon1;
  const name2 = req.body.testDbGameUser2;
  const attempts2 = parseInt(req.body.testDbGameAttemptsUser2);
  const won2 = !!req.body.testDbWon2;
  const NumberOfWords = parseInt(req.body.NumberOfWords);

  console.log(name1);
  console.log(attempts1);
  console.log(won1);
  console.log(name2);
  console.log(attempts2);
  console.log(won2);
  console.log(NumberOfWords);

  console.log(req.body);

  let gameR = models.GameRoom.build({
    letters: NumberOfWords,
  });
  let savedGame = await gameR.save();

  console.log(savedGame.id);

  let gameUser1 = models.GameState.build({
    gr_id: savedGame.id,
    user_name: name1,
    win: won1,
    attempts: attempts1,
  });

  let gameUser2 = models.GameState.build({
    gr_id: savedGame.id,
    user_name: name2,
    win: won2,
    attempts: attempts2,
  });

  let user1 = await gameUser1.save();
  let user2 = await gameUser2.save();

  console.log("_________________________");
  console.log(user1);
  console.log(user2);

  res.redirect("/dbtest");

  // await models.GameState.build({
  //     gr_id
  // })
  // const gameR = await GameRoom.create(req.body)
});
console.log("tets");
module.exports = router;
