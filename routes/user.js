const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const models = require("../models");
const { redirect } = require("express/lib/response");

const SALT_ROUNDS = 10;

router.get("/register", (req, res) => {
    res.render("register");
});

router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/register", async (req, res) => {
    try {
        const { email, username, password, passwordRepeat } = req.body;

        if (password !== passwordRepeat) {
            res.render("index", { error: "Passwords do not match!" });
        }

        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hash = await bcrypt.hash(password, salt);

        const user = models.User.build({
            name: username,
            email,
            password: hash,
        });

        await user.save();
        req.session.username = username;
        req.session.save();
    } catch (err) {
        console.log(err);
    } finally {
        res.redirect("/");
    }
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await models.User.findOne({
            where: {
                name: username,
            },
        });

        const result = bcrypt.compare(password, user.password);
        if (!result) {
            throw new Error("Error logging in");
        }

        req.session.username = username;
    } catch (err) {
        console.log(err);
    } finally {
        res.redirect("/");
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
