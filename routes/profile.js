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
};

router.get("/", (req, res) => {
  res.render("profile", { test });
});

//
module.exports = router;
