const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const hbs = require("express-hbs");

const sessionMiddleware = require("./middleware/sessionMiddleware");
const registerWordleHandlers = require("./socket/registerWordleHandlers");
const registerTournamentHandlers = require("./socket/registerTournamentHandlers");

const PORT = process.env.PORT || 8080;

app.engine(
  "hbs",
  hbs.express4({
    partialsDir: __dirname + "/views/partials",
  })
);
app.set("views", "./views");
app.set("view engine", "hbs");

app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(express.static("public"));

io.use((socket, next) => {
  // gives access to socket.request.session
  sessionMiddleware(socket.request, {}, next);
});

io.of("/wordle").on("connection", (socket) => {
  // Allows socket events to be handled in a separate file
  registerWordleHandlers(io, socket);
});

io.of("/tournaments").on("connection", (socket) => {
  // Allows socket events to be handled in a separate file
  registerTournamentHandlers(io, socket);
});

http.listen(PORT, () => console.log(`Wordle Clash running on port ${PORT}`));
