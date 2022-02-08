const socket = io("/wordle");
const gameContainer = document.getElementById("gameContainer");
const hideCount = document.getElementById("hideCount");
const guesses = document.getElementById("guesses");
const keyboard = document.getElementById("keyboard");

const reLetters = /[a-zA-Z]/
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
    "not-in-word": "not-in-word"
}

const updateAfterXMs = (ms, target, className) => {
    setTimeout(() => {
        target.classList.add(className, 'flip');
        keyboard.querySelector(`#${target.innerHTML}`)
            .className = `key ${className}`
    }, ms)
}

const updateRowDisplay = () => {
    if (!playing) return;
    for (let i = 0; i < numLetters; i++) {
        const letterToInsert = currentGuessString[i] ? currentGuessString[i] : ''
        currentRow.children[i].innerHTML = letterToInsert;
    }
}

const addLetterToGuess = (letter) => {
    if (!playing) return;
    if (currentGuessString.length < numLetters) {
        currentGuessString += letter;
    }
    updateRowDisplay();
}

const removeLetterFromGuess = () => {
    if (!playing) return;
    if (currentGuessString.length > 0) {
        currentGuessString = currentGuessString.substring(0, currentGuessString.length - 1)
    }
    updateRowDisplay();
}

const submitAnswer = () => {
    if (!playing) return;
    socket.emit('guess', {guess: currentGuessString})
}

socket.on("connect", () => {
    socket.emit("new-game", { gameMode: "practice", numLetters });
});

socket.on("secret-word", () => {
    setCurrentRow();
    console.log('ready');
})

socket.on("invalid-guess", () => {
    alert("invalid guess");
});

socket.on("correct-word", () => {
    for (let i = 0; i < numLetters; i++) {
        updateAfterXMs(i * 50, currentRow.children[i], 'correct')
    }
    playing = false;
});

socket.on("guess-results", (data) => {
    data.results.forEach((result, i) => {
        updateAfterXMs(i * 50, currentRow.children[i], resultToClassMap[result]);
    })
    setCurrentRow();
})

keyboard.addEventListener('click', (e) => {
    if (e.target.id.length === 1) {
        addLetterToGuess(e.target.id)
    } else if (e.target.id === 'backspace' || e.target.parentElement.id === 'backspace') {
        removeLetterFromGuess();
    } else if (e.target.id === 'enter') {
        submitAnswer();
    }
})


window.addEventListener('keydown', (e) => {
    if (e.key === "Enter" && currentGuessString.length === numLetters) {
        submitAnswer();
    } else if (e.key === 'Backspace') {
        removeLetterFromGuess();
    } else if (e.key.length === 1 && reLetters.test(e.key)) {
        addLetterToGuess(e.key.toLowerCase())
    }
})

