const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const models = require("../models");
const authenticateMiddleware = require("../middleware/authenticateMiddleware");

const SALT_ROUNDS = 10;

router.get("/login", (req, res) => {
    res.render("login");
});

router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/login", async (req, res) => {
    let name = req.body.name;
    let password = req.body.password;

    let user = await models.User.findOne({
        where: {
            name: name,
        },
    });
    if (user != null) {
        bcrypt.compare(password, user.password, (error, result) => {
            if (result) {
                req.session.user = { userId: user.id, name: name };
                res.redirect("/");
            } else {
                res.render("index", { message: "Incorrect password" });
            }
        });
    } else {
        res.render("index", { message: "Wrong Username" });
    }
});

router.post("/register", async (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;

    let persistedUser = await models.User.findOne({
        where: {
            email: email,
        },
    });

    if (persistedUser == null) {
        bcrypt.hash(password, SALT_ROUNDS, async (error, hash) => {
            if (error) {
                res.render("/register", { message: "Error creating user" });
            } else {
                let user = models.User.build({
                    name: name,
                    email: email,
                    password: hash,
                });
                try {
                    let savedUser = await user.save();
                    if (savedUser != null) {
                        req.session.user = { userId: savedUser.id, name: name };
                        res.redirect("/");
                    } else {
                        res.render("/register", {
                            message: "User already exists!",
                        });
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        });
    } else {
        res.render("/register", { message: "User already exists!" });
    }
});

router.get("/logout", (req, res, next) => {
    if (req.session) {
        req.session.destroy((error) => {
            if (error) {
                next(error);
            } else {
                res.redirect("/");
            }
        });
    }
});

module.exports = router;
