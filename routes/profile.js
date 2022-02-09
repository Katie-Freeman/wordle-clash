const express = require("express");
const router = express.Router();

const test = {
  name: "KeyboardWarrior",
  email: " keyWarrior001@email.com",
  total: {
    games: 99,
    won: 89,
    loss: 10,
    avrg: 5.7,
  },
  4: {
    games: 12,
    won: 10,
    loss: 2,
    avrg: 3.7,
  },
  5: {
    games: 11,
    won: 11,
    loss: 0,
    avrg: 4.8,
  },
  6: {
    games: 21,
    won: 19,
    loss: 2,
    avrg: 5.9,
  },
  7: {
    games: 5,
    won: 2,
    loss: 3,
    avrg: 7,
  },
  8: {
    games: 3,
    won: 3,
    loss: 0,
    avrg: 6.2,
  },
};

router.get("/", (req, res) => {
  res.render("profile", { test });
});

//
module.exports = router;
