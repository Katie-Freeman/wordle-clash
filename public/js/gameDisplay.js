const calculateVH = () => {
    const vh = window.innerHeight * 0.01;
    const max = window.innerHeight - 325;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
    document.documentElement.style.setProperty("--max", `${max}px`);
};

const getResultClass = (result) => {
    const resultToClassMap = {
        "in-place": "correct",
        "out-of-place": "wrong-placement",
        "not-in-word": "not-in-word",
    };

    return resultToClassMap[result];
};

const getLoadingMessage = (status) => {
    const statusToMessageMap = {
        loading: "We're setting up your match!",
        busy: "Player is in another match! Please try again later.",
        waiting: "Searching for player to match with...",
        disconnect: "Your opponent disconnected",
        rejected: "The player has declined your match invitation.",
    };

    return statusToMessageMap[status];
};

const makeFreshStatusBoxHTML = (opponent) => {
    const titleText = opponent ? `${opponent}:` : "Solo Game";
    return `
        <b>${titleText}</b><div class="opponent-guess"></div>
    `;
};

const makeOpponentGuessHTML = (count, results) => {
    const resultItems = results.map(
        (result) => `
        <span class="opponent-guess-letter ${getResultClass(result)}">.</span>
    `
    );

    return `${count} - ${resultItems.join("")}`;
};

const makeOpponentFinalStatusHTML = (count) => {
    let finalText = "";
    if (count) {
        finalText += `Correctly guessed in ${count} turn${
            count > 1 ? "s" : ""
        }`;
    } else {
        finalText += "Did not guess the word";
    }

    return `<div class="opponent-result">[${finalText}]</div>`;
};

const makeGuessLetterBoxes = (count) => {
    const letterBoxes = Array(count).fill('<h2 class="guess-letter"></h2>');
    const letterRows = Array(6).fill(`
        <div class="guess-row">
            ${letterBoxes.join("")}
        </div>
    `);
    return letterRows.join("");
};

const makeLoadingHTML = (status = "loading") => {
    return `
        <div id="match-pending">
            <h2>${getLoadingMessage(status)}</h2>
            <div class="progress">
                <div 
                    class="progress-bar progress-bar-striped progress-bar-animated loading"
                    role="progressbar"
                ></div>
            </div>
        </div>
    `;
};

const makeMatchResultHTML = (matchResult, wordLength) => {
    const { stats, winner } = matchResult;
    const statItems = stats.map((stat) => {
        const lastGuessArray = stat.wordGuessed
            ? new Array(wordLength).fill("in-place")
            : stat.lastResult;

        return `
        <div class="stat">
            <h4>${stat.name}</h4>
            <p><i>${stat.guessCount} guesses</i><p>
            <p><b>Word Guessed: ${stat.wordGuessed ? "YES" : "NO"}</b></p>
            <p>Last Guess Result:</p>
            <div>
                ${makeOpponentGuessHTML(0, lastGuessArray).substring(3)}
            </div>
        </div>
    `;
    });
    return `
        <div class="match-result">
            <h3>Winner: ${winner}</h3>
            <div class="match-stats">
                ${statItems.join("")}
            </div>
        </div>
    `;
};

const makeNewKeyboardHTML = () => {
    return `
        <div class="keyboard-row">
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
        </div>
    `;
};

const displayWarningBox = (message) => {
    const warning = document.createElement("div");
    warning.id = "warning";
    warning.innerHTML = message;
    document.body.appendChild(warning);
    setTimeout(() => (warning.className = "active"), 1);
    setTimeout(() => (warning.className = ""), 650);
    setTimeout(() => document.body.removeChild(warning), 850);
};

const displayInviteBox = (user, letterCount, yesHandler, noHandler) => {
    const newGame = document.createElement("div");
    newGame.id = "newGame";
    newGame.className = "game-popup";
    newGame.innerHTML = `
        <h3>${user} has invited you to a ${letterCount} letter game!</h3>
        <p>Do you accept this invitation?</p>
        <div class="match-options">
            <button class="btn btn-success">Yes</button>
            <button class="btn btn-danger">No</button>
        </div>
    `;
    const yesBtn = newGame.querySelector(".btn-success");
    const noBtn = newGame.querySelector(".btn-danger");

    yesBtn.addEventListener("click", yesHandler);
    noBtn.addEventListener("click", noHandler);

    document.body.appendChild(newGame);
    setTimeout(() => newGame.classList.add("active"), 1);
};

const setupInviteHandler = (parentEl, inviteHandler, numLettersSelect) => {
    const invite = parentEl.querySelector("#invite");
    const inviteName = parentEl.querySelector("#inviteName");

    const sendInvite = () => {
        const userToInvite = inviteName.value;
        if (!userToInvite) {
            alert("Please enter in a username.");
        } else {
            const letterCount = parseInt(numLettersSelect.value);
            inviteHandler(letterCount, userToInvite);
        }
    };

    inviteName.addEventListener("keydown", ({ key }) => {
        if (key === "Enter") {
            sendInvite();
        }
    });
    invite.addEventListener("click", sendInvite);
};

const setupClickHandlers = (
    parentEl,
    soloHandler,
    matchHandler,
    inviteHandler
) => {
    const numLettersSelect = parentEl.querySelector("#numLettersSelect");
    const solo = parentEl.querySelector("#solo");
    const match = parentEl.querySelector("#match");

    if (solo) {
        solo.addEventListener("click", () => {
            const letterCount = parseInt(numLettersSelect.value);
            soloHandler(letterCount);
        });
    }
    if (match) {
        match.addEventListener("click", () => {
            const letterCount = parseInt(numLettersSelect.value);
            matchHandler(letterCount);
        });
    }

    if (inviteHandler) {
        setupInviteHandler(parentEl, inviteHandler, numLettersSelect);
    }
};

const displaySelectOptions = () => {
    return `
        <select id="numLettersSelect" class="form-control">
            <option>4</option>
            <option>5</option>
            <option>6</option>
            <option>7</option>
            <option>8</option>
        </select>
    `;
};

const displayNewGameControls = (user) => {
    const matchButton = user
        ? '<button id="match" class="btn btn-success">Match</button>'
        : "<i>Log in or create an account to match against others.</i>";

    return `
        ${displaySelectOptions()}
        <div class="gameButtons">
            <button id="solo" class="btn btn-primary">Solo</button>
            <hr class="hr">
            ${matchButton}
        </div>
    `;
};

const displayNewGameBox = (user, soloHandler, matchHandler) => {
    const newGame = document.createElement("div");
    newGame.id = "newGame";
    newGame.className = "game-popup";
    newGame.innerHTML = `
        <h3>New Game</h3>
        <i>Warning: Current game's stats will NOT be saved</i>
        ${displayNewGameControls(user)}
    `;

    setupClickHandlers(newGame, soloHandler, matchHandler);
    document.body.appendChild(newGame);
    setTimeout(() => newGame.classList.add("active"), 1);
};

const displayMakeMatchBox = (matchHandler, inviteHandler) => {
    const newMatch = document.createElement("div");
    newMatch.id = "newMatch";
    newMatch.className = "game-popup";
    newMatch.innerHTML = `
        <h3>New Match</h3>
        <div class="gameButtons">
            <button id="match" class="btn btn-success">Random Match</button>
            <hr class="hr">
            ${displaySelectOptions()}
            <h4>Invite a Friend</h4>
            <input type="text" id="inviteName" class="form-control" placeholder="Username to invite">
            <button id="invite" class="btn btn-info">Invite</button>
        </div>
    `;

    setupClickHandlers(newMatch, null, matchHandler, inviteHandler);
    document.body.appendChild(newMatch);
    setTimeout(() => newMatch.classList.add("active"), 1);
};

const displayResultsBox = (user, secretWord, handlers, matchResult) => {
    const result = document.createElement("div");
    let matchInfo = "";
    result.id = "result";
    result.className = "game-popup";
    if (matchResult) {
        matchInfo = makeMatchResultHTML(matchResult, secretWord.length);
        result.classList.add("match");
    }
    result.innerHTML = `
        <i>Secret Word:</i>
        <h2 class="secret">${secretWord}</h2>
        ${matchInfo}
        <h3 id="again">Play Again?</h3>
        ${displayNewGameControls(user)}
    `;

    setupClickHandlers(result, handlers.soloHandler, handlers.matchHandler);
    document.body.appendChild(result);
    setTimeout(() => result.classList.add("active"), 1);
};

export default {
    calculateVH,
    getResultClass,
    makeGuessLetterBoxes,
    makeLoadingHTML,
    makeFreshStatusBoxHTML,
    makeOpponentGuessHTML,
    makeOpponentFinalStatusHTML,
    makeNewKeyboardHTML,
    displayWarningBox,
    displayInviteBox,
    displayNewGameBox,
    displayMakeMatchBox,
    displayResultsBox,
};
