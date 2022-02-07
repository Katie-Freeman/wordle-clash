const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const hbs = require("express-hbs");
const userRoutes = require("./routes/user");
const indexRoutes = require("./routes/index");
const utilsRoutes = require("./routes/utils");
const session = require("express-session");

const sessionMiddleware = require("./middleware/sessionMiddleware");
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

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use("/user", userRoutes);
app.use("/utils", utilsRoutes);
app.use("/index", indexRoutes);

io.use((socket, next) => {
  // gives access to socket.request.session
  sessionMiddleware(socket.request, {}, next);
});

io.on("connection", (socket) => {
  // Allows socket events to be handled in a separate file
  registerWordleHandlers(io, socket);
});

// http.listen(PORT, () => console.log(`Wordle Clash running on port ${PORT}`));

app.listen(PORT, () => {
  console.log(`Server has started on ${PORT}`);
});
