const socket = io("/wordle");
const test = document.getElementById("test");
const guesses = document.getElementById("guesses");
const notWordGuessbtn = document.getElementById("notWordGuess");
const incorrectGuessbtn = document.getElementById("incorrectGuess");
const correctGuessbtn = document.getElementById("correctGuess");

let secretWord;
let guessCount = 1;

socket.on("connect", () => {
  socket.emit("new-game", { gameMode: "practice", numLetters: 5 });
});

socket.on("secret-word", (data) => {
  secretWord = data.word;
  test.innerHTML = secretWord;
});

socket.on("invalid-guess", () => {
  alert("invalid guess");
});

socket.on("correct-word", () => {
  alert("correct-word");
});

socket.on("guess-results", (data) => {
  alert(data.results.join(" | "));
});

notWordGuessbtn.addEventListener("click", () => {
  socket.emit("guess", { guessCount, guess: "aaaaa" });
});

incorrectGuessbtn.addEventListener("click", () => {
  const guess = secretWord === "level" ? "blade" : "level";
  socket.emit("guess", { guessCount, guess });
});

correctGuessbtn.addEventListener("click", () => {
  socket.emit("guess", { guessCount, guess: secretWord });
});
