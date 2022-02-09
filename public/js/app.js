import gameDisplay from "./gameDisplay.js";
const socket = io("/wordle");
const warning = document.getElementById("warning");
const result = document.getElementById("result");
const numLettersSelect = document.getElementById("numLettersSelect");
const solo = document.getElementById("solo");
const match = document.getElementById("match");
const gameContainer = document.getElementById("gameContainer");
const hideCount = document.getElementById("hideCount");
const guesses = document.getElementById("guesses");
const keyboard = document.getElementById("keyboard");

const reLetters = /[a-zA-Z]/;
let guessCount = 0;
let currentGuessString = "";
let numLetters = parseInt(hideCount.content);
let playing = false;

let currentRow;

const setCurrentRow = () => {
    if (currentRow) {
        currentRow.classList.remove("active");
    }
    guessCount++;
    currentRow = guesses.children[guessCount - 1];
    currentRow.classList.add("active");
    currentGuessString = "";
};

const displayInvalidSubmission = (message) => {
    currentRow.classList.add("shake");
    gameDisplay.displayWarningBox(message);
    setTimeout(() => {
        currentRow.classList.remove("shake");
    }, 650);
};

const setupNewGame = (mode) => {
    guessCount = 0;
    currentGuessString = "";
    playing = true;
    const lettersH2s = gameDisplay.makeGuessLetterBoxes(numLetters);
    for (let i = 0; i < 6; i++) {
        guesses.children[i].innerHTML = lettersH2s.join("");
    }
    keyboard.innerHTML = gameDisplay.makeNewKeyboardHTML();

    socket.emit("new-game", { gameMode: "solo", numLetters });
};

const handleNewGamePopup = (letterCount) => {
    numLetters = letterCount;
    setupNewGame();
};

const displayResult = (secretWord) => {
    gameDisplay.displayResultsBox(secretWord.toUpperCase(), handleNewGamePopup);
};

const updateAfterXMs = (ms, target, className) => {
    setTimeout(() => {
        target.classList.add(className, "flip");
        keyboard.querySelector(
            `#${target.innerHTML}`
        ).className = `key ${className}`;
    }, ms);
};

const updateRowDisplay = () => {
    if (!playing) return;
    for (let i = 0; i < numLetters; i++) {
        const letterToInsert = currentGuessString[i]
            ? currentGuessString[i]
            : "";
        currentRow.children[i].innerHTML = letterToInsert;
    }
};

const addLetterToGuess = (letter) => {
    if (!playing) return;
    if (currentGuessString.length < numLetters) {
        currentGuessString += letter;
    }
    updateRowDisplay();
};

const removeLetterFromGuess = () => {
    if (!playing) return;
    if (currentGuessString.length > 0) {
        currentGuessString = currentGuessString.substring(
            0,
            currentGuessString.length - 1
        );
    }
    updateRowDisplay();
};

const submitAnswer = () => {
    if (!playing) return;
    if (currentGuessString.length === numLetters) {
        socket.emit("guess", { guess: currentGuessString, count: guessCount });
    } else {
        displayInvalidSubmission("Not enough letters");
    }
};

socket.on("connect", () => {
    setupNewGame();
});

socket.on("secret-word", () => {
    setCurrentRow();
    const result = document.getElementById("result");
    if (result) {
        document.body.removeChild(result);
    }
    playing = true;
});

socket.on("invalid-guess", () => {
    displayInvalidSubmission("Word not found.");
});

socket.on("correct-word", () => {
    for (let i = 0; i < numLetters; i++) {
        updateAfterXMs(i * 50, currentRow.children[i], "correct");
    }
    // emit to get stats ?
    displayResult(currentGuessString);
    playing = false;
});

socket.on("guess-results", (data) => {
    data.results.forEach((result, i) => {
        updateAfterXMs(
            i * 50,
            currentRow.children[i],
            gameDisplay.getResultClass(result)
        );
    });
    if (guessCount < 6) {
        setCurrentRow();
    } else {
        displayResult(data.secretWord);
    }
});

keyboard.addEventListener("click", (e) => {
    if (e.target.id.length === 1) {
        addLetterToGuess(e.target.id);
    } else if (
        e.target.id === "backspace" ||
        e.target.parentElement.id === "backspace"
    ) {
        removeLetterFromGuess();
    } else if (e.target.id === "enter") {
        submitAnswer();
    }
});

window.addEventListener("keydown", (e) => {
    if (e.target !== document.body) return;
    if (e.key === "Enter") {
        submitAnswer();
    } else if (e.key === "Backspace") {
        removeLetterFromGuess();
    } else if (e.key.length === 1 && reLetters.test(e.key)) {
        addLetterToGuess(e.key.toLowerCase());
    }
});

window.addEventListener("resize", () => {
    gameDisplay.calculateVH();
});

gameDisplay.calculateVH();
