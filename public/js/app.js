import gameDisplay from "./gameDisplay.js";
const socket = io("/wordle");
const letterCountMeta = document.getElementById("letterCountMeta");
const newGameLink = document.getElementById("newGameLink");
const guesses = document.getElementById("guesses");
const status = document.getElementById("status");
const keyboard = document.getElementById("keyboard");

const reLetters = /[a-zA-Z]/;
let guessCount = 0;
let currentGuessString = "";
let numLetters = parseInt(letterCountMeta.content);
let playing = false;
let user;
let opponent;
let currentRow;

const clearPopups = () => {
    const popupIds = ["result", "newGame", "newMatch"];
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

const setupNewGame = () => {
    guessCount = 0;
    currentGuessString = "";
    playing = true;
    status.innerHTML = gameDisplay.makeFreshStatusBoxHTML(opponent);
    guesses.classList.remove("loading");
    guesses.innerHTML = gameDisplay.makeGuessLetterBoxes(numLetters);
    keyboard.innerHTML = gameDisplay.makeNewKeyboardHTML();
};

const handleNewSoloGameFromPopup = (letterCount) => {
    numLetters = letterCount;
    socket.emit("new-game", { gameMode: "solo", numLetters });
};

const handleNewMatchGameFromPopup = (letterCount) => {
    clearPopups();
    numLetters = letterCount;
    socket.emit("new-game", { gameMode: "match", numLetters });
};

const handleInviteFromPopup = (letterCount, userToInvite) => {
    clearPopups();
    numLetters = letterCount;
    socket.emit("new-game", {
        gameMode: "invite",
        numLetters,
        username: userToInvite,
    });
};

const handleMatchFromPopup = () => {
    clearPopups();
    gameDisplay.displayMakeMatchBox(
        handleNewMatchGameFromPopup,
        handleInviteFromPopup
    );
};

const displayResult = (secretWord) => {
    gameDisplay.displayResultsBox(
        user,
        secretWord.toUpperCase(),
        handleNewSoloGameFromPopup,
        handleMatchFromPopup
    );
};

const displayLoading = (status) => {
    guesses.classList.add("loading");
    guesses.innerHTML = gameDisplay.makeLoadingHTML(status);
};

const updateAfterXMs = (ms, target, className) => {
    setTimeout(() => {
        target.classList.add(className, "flip");
        const virtualKey = keyboard.querySelector(`#${target.innerHTML}`);

        // virtual keyboard should not go backward in progression.
        if (
            virtualKey.classList.contains("correct") ||
            (virtualKey.classList.contains("wrong-placement") &&
                className === "not-in-word")
        ) {
            return;
        }

        virtualKey.className = `key ${className}`;
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

const processResults = (results) => {
    results.forEach((result, i) => {
        updateAfterXMs(
            i * 50,
            currentRow.children[i],
            gameDisplay.getResultClass(result)
        );
    });
};

// socket handlers

socket.on("connect", () => {
    socket.emit("new-game", { gameMode: "solo", numLetters });
});

socket.on("user-info", (data) => {
    user = data.user;
});

socket.on("secret-word-ready", (data) => {
    if (data) {
        numLetters = data.numLetters;
        opponent = data.name;
    }
    clearPopups();
    setupNewGame();
    setCurrentRow();
    playing = true;
});

socket.on("invalid-guess", () => {
    displayInvalidSubmission("Word not found.");
});

socket.on("correct-word", () => {
    processResults(new Array(numLetters).fill("in-place"));
    displayResult(currentGuessString);
    playing = false;
});

socket.on("guess-results", (data) => {
    processResults(data.results);
    if (guessCount < 6) {
        setCurrentRow();
    } else {
        playing = false;
        displayResult(data.secretWord);
    }
});

socket.on("word-failed-waiting", (data) => {
    processResults(data.lastGuess);
    playing = false;
});

socket.on("word-guessed-waiting", () => {
    processResults(new Array(numLetters).fill("in-place"));
    playing = false;
});

socket.on("match-result", (data) => {
    alert(data.winner);
});

socket.on("unable-to-match", (data) => {
    alert(data.message);
});

socket.on("user-found", () => {
    displayLoading();
});

socket.on("user-busy", () => {
    displayLoading("busy");
});

socket.on("waiting", () => {
    displayLoading("waiting");
});

socket.on("reject-request", () => {
    displayLoading("rejected");
});

socket.on("match-request", (data) => {
    const { username, numLetters } = data;
    const handleYesClick = () => {
        clearPopups();
        socket.emit("accept-request", { username, numLetters });
    };
    const handleNoClick = () => {
        clearPopups();
        socket.emit("reject-request", { username });
    };

    gameDisplay.displayInviteBox(
        username,
        numLetters,
        handleYesClick,
        handleNoClick
    );
});

socket.on("opponent-guess-results", (data) => {
    const { results, count, username } = data;
    if (username !== user.name) {
        status.insertAdjacentHTML(
            "beforeend",
            gameDisplay.makeOpponentGuessHTML(count, results)
        );
    }
});

socket.on("opponent-out", (data) => {
    const { username } = data;
    if (username !== user.name) {
        status.insertAdjacentHTML(
            "beforeend",
            gameDisplay.makeOpponentFinalStatusHTML()
        );
    }
});

socket.on("opponent-guessed-word", (data) => {
    const { username, count } = data;
    if (username !== user.name) {
        status.insertAdjacentHTML(
            "beforeend",
            gameDisplay.makeOpponentFinalStatusHTML(count)
        );
    }
});

socket.on("opponent-disconnected", () => {
    displayLoading("disconnect");
});

// Other Event Handlers

newGameLink.addEventListener("click", () => {
    clearPopups();
    gameDisplay.displayNewGameBox(
        user,
        handleNewSoloGameFromPopup,
        handleMatchFromPopup
    );
});

keyboard.addEventListener("click", (e) => {
    clearPopups();
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
    clearPopups();
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
