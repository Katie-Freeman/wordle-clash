const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const hbs = require("express-hbs");
const userRoutes = require("./routes/user");
const indexRoutes = require("./routes/index");
const profileRoutes = require("./routes/profile");
const dbtestRoutes = require("./routes/dbtest"); //NOTE for testing

const sessionMiddleware = require("./middleware/sessionMiddleware");

const authenticateMiddleware = require("./middleware/authenticateMiddleware");

const resLocalsMiddleware = require("./middleware/resLocalsMiddleware");

const registerWordleHandlers = require("./socket/registerWordleHandlers");
const registerTournamentHandlers = require("./socket/registerTournamentHandlers");

const PORT = process.env.PORT || 3000;

app.engine(
    "hbs",
    hbs.express4({
        partialsDir: __dirname + "/views/partials",
    })
);
app.set("views", "./views");
app.set("view engine", "hbs");
app.use(sessionMiddleware);
app.use(resLocalsMiddleware);
app.use(express.urlencoded({ extended: true }));

io.connectedUsers = [];
io.usersLookingForMatch = [];
io.of("/wordle").use((socket, next) => {
    // grants access to session within io handlers
    sessionMiddleware(socket.request, {}, next);
});

app.use("/profile", profileRoutes);
app.use("/dbtest", dbtestRoutes);
app.use("/user", userRoutes);
app.use("/", indexRoutes);
app.use(express.static("public"));

io.of("/wordle").on("connection", (socket) => {
    // Allows socket events to be handled in a separate file
    registerWordleHandlers(io, socket);
});

io.of("/tournaments").on("connection", (socket) => {
    // Allows socket events to be handled in a separate file
    registerTournamentHandlers(io, socket);
});

http.listen(PORT, () => {
    console.log(`Wordle Clash has started on ${PORT}`);
});
