const session = require("express-session");
const getSecretKey = require("../util/getSecretKey");
const secretKey = getSecretKey();

const sessionMiddleware = session({
    secret: secretKey,
    saveUninitialized: true,
    resave: true
});

module.exports = sessionMiddleware;
