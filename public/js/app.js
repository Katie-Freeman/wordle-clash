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
let numLetters = parseInt(hideCount.innerHTML);
let playing = true;

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

const resultToClassMap = {
    "in-place": "correct",
    "out-of-place": "wrong-placement",
    "not-in-word": "not-in-word",
};

const displayInvalidSubmission = (message) => {
    currentRow.classList.add("shake");
    warning.innerHTML = message;
    warning.classList.add("active");
    setTimeout(() => {
        currentRow.classList.remove("shake");
        warning.classList.remove("active");
    }, 650);
};

const displayResult = (secretWord) => {
    result.querySelector('.secret').innerHTML = secretWord.toUpperCase();
    result.classList.add('active');
}

const updateAfterXMs = (ms, target, className) => {
    setTimeout(() => {
        target.classList.add(className, "flip");
        keyboard.querySelector(
            `#${target.innerHTML}`
        ).className = `key ${className}`;
    }, ms);
};

const setupNewGame = (mode) => {
    guessCount = 0;
    currentGuessString = "";
    playing = true;
    const lettersH2s = new Array(numLetters).fill(
        '<h2 class="guess-letter"></h2>'
    );
    for (let i = 0; i < 6; i++) {
        guesses.children[i].innerHTML = lettersH2s.join('');
    }

    socket.emit("new-game", { gameMode: "solo", numLetters });
}

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
        displayInvalidSubmission('Not enough letters')
    }
};

socket.on("connect", () => {
    setupNewGame();
});

socket.on("secret-word", () => {
    setCurrentRow();
    result.classList.remove('active');
    console.log("ready");
});

socket.on("invalid-guess", () => {
    displayInvalidSubmission("Word not found.");
});

socket.on("correct-word", () => {
    for (let i = 0; i < numLetters; i++) {
        updateAfterXMs(i * 50, currentRow.children[i], "correct");
    }
    // emit to get stats ?
    displayResult(currentGuessString)
    playing = false;
});

socket.on("guess-results", (data) => {
    data.results.forEach((result, i) => {
        updateAfterXMs(
            i * 50,
            currentRow.children[i],
            resultToClassMap[result]
        );
    });
    if (guessCount < 6) {
        setCurrentRow();
    } else {
        displayResult(data.secretWord)
    }

});

solo.addEventListener('click', () => {
    numLetters = parseInt(numLettersSelect.value)
    setupNewGame();
})

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
