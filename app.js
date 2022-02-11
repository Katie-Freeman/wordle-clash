const express = require("express");
const app = express();
const http = require("http").Server(app);
const IO = require("socket.io")(http);
const hbs = require("express-hbs");
const userRoutes = require("./routes/user");
const profileRoutes = require("./routes/profile");

const sessionMiddleware = require("./middleware/sessionMiddleware");
const resLocalsMiddleware = require("./middleware/resLocalsMiddleware");
const registerWordleHandlers = require("./socket/registerWordleHandlers");

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

const io = IO.of("/wordle");
io.connectedUsers = [];
io.usersLookingForMatch = [];

io.use((socket, next) => {
  // grants access to session within io handlers
  sessionMiddleware(socket.request, {}, next);
});

app.use("/profile", profileRoutes);
app.use("/user", userRoutes);
app.use(express.static("public"));

io.on("connection", (socket) => {
  // Allows socket events to be handled in a separate file
  registerWordleHandlers(io, socket);
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/instructions", (req, res) => {
  res.render("instructions");
});

http.listen(PORT, () => {
  console.log(`Wordle Clash has started on ${PORT}`);
});


