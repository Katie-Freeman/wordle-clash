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
    result.querySelector(".secret").innerHTML = secretWord.toUpperCase();
    result.classList.add("active");
};

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
        guesses.children[i].innerHTML = lettersH2s.join("");
    }

    keyboard.innerHTML = `<div class="keyboard-row">
                <div id="q" class="key">Q</div>
                <div id="w" class="key">W</div>
                <div id="e" class="key">E</div>
                <div id="r" class="key">R</div>
                <div id="t" class="key">T</div>
                <div id="y" class="key">Y</div>
                <div id="u" class="key">U</div>
                <div id="i" class="key">I</div>
                <div id="o" class="key">O</div>
                <div id="p" class="key">P</div>
            </div>
            <div class="keyboard-row">
                <div id="a" class="key">A</div>
                <div id="s" class="key">S</div>
                <div id="d" class="key">D</div>
                <div id="f" class="key">F</div>
                <div id="g" class="key">G</div>
                <div id="h" class="key">H</div>
                <div id="j" class="key">J</div>
                <div id="k" class="key">K</div>
                <div id="l" class="key">L</div>
            </div>
            <div class="keyboard-row">
                <div id="enter" class="key">Enter</div>
                <div id="z" class="key">Z</div>
                <div id="x" class="key">X</div>
                <div id="c" class="key">C</div>
                <div id="v" class="key">V</div>
                <div id="b" class="key">B</div>
                <div id="n" class="key">N</div>
                <div id="m" class="key">M</div>
                <div id="backspace" class="key"><img src="/images/backspace.png" alt="backspace"></div>
            </div>`;

    socket.emit("new-game", { gameMode: "solo", numLetters });
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
    result.classList.remove("active");
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
    displayResult(currentGuessString);
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
        displayResult(data.secretWord);
    }
});

solo.addEventListener("click", () => {
    numLetters = parseInt(numLettersSelect.value);
    setupNewGame();
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
