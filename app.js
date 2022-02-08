const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const hbs = require("express-hbs");

const sessionMiddleware = require("./middleware/sessionMiddleware");
const registerWordleHandlers = require("./socket/registerWordleHandlers");
const registerTournamentHandlers = require("./socket/registerTournamentHandlers");

const PORT = process.env.PORT || 3000;

app.engine(
    "hbs",
    hbs.express4({
        partialsDir: __dirname + "/views/partials"
    })
);
app.set("views", "./views");
app.set("view engine", "hbs");

app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
io.of('/wordle').use((socket, next) => {
    // grants access to session within io handlers
    sessionMiddleware(socket.request, {}, next);
})
io.of('/tournaments').use((socket, next) => {
    // grants access to session within io handlers
    sessionMiddleware(socket.request, {}, next);
})
app.use(express.static("public"));

app.get('/game', (req, res) => {
    let letterCount = 4;
    if (req.session && req.session.lastLetterCount) {
        letterCount = req.session.lastLetterCount;
    }

    const letterBoxes = new Array(letterCount).fill('.');
    res.render('game', {boxes: letterBoxes})
})

io.of("/wordle").on("connection", (socket) => {
    // Allows socket events to be handled in a separate file
    registerWordleHandlers(io, socket);
});

io.of("/tournaments").on("connection", (socket) => {
    // Allows socket events to be handled in a separate file
    registerTournamentHandlers(io, socket);
});

http.listen(PORT, () => console.log(`Wordle Clash running on port ${PORT}`));
