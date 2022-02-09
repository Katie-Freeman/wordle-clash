import gameDisplay from "./gameDisplay.js";
const socket = io("/wordle");
const letterCountMeta = document.getElementById("letterCountMeta");
const newGameLink = document.getElementById("newGameLink");
const guesses = document.getElementById("guesses");
const keyboard = document.getElementById("keyboard");

const reLetters = /[a-zA-Z]/;
let guessCount = 0;
let currentGuessString = "";
let numLetters = parseInt(letterCountMeta.content);
let playing = false;
let user;
let currentRow;

const clearPopups = () => {
    const popupIds = ["result", "newGame"];
    popupIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            document.body.removeChild(el);
        }
    });
};

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

const handleNewSoloGameFromPopup = (letterCount) => {
    numLetters = letterCount;
    setupNewGame();
};

const displayResult = (secretWord) => {
    gameDisplay.displayResultsBox(
        user,
        secretWord.toUpperCase(),
        handleNewSoloGameFromPopup
    );
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

socket.on("user-info", (data) => {
    user = data.user;
});

socket.on("secret-word", () => {
    setCurrentRow();
    clearPopups();
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

newGameLink.addEventListener("click", () => {
    gameDisplay.displayNewGameBox(user, handleNewSoloGameFromPopup);
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
