const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const getSecretKey = require("../util/getSecretKey");
const secretKey = getSecretKey();

const sessionMiddleware = session({
    secret: secretKey,
    store: new SQLiteStore(),
    saveUninitialized: true,
    resave: true,
});

module.exports = sessionMiddleware;
