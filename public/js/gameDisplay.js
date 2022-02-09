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

const makeGuessLetterBoxes = (count) =>
    new Array(count).fill('<h2 class="guess-letter"></h2>');

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

const setupInviteHandler = (inviteHandler, letterCount) => {
    const invite = parentEl.querySelector("#invite");
    const inviteName = parentEl.querySelector("#inviteName");

    invite.addEventListener("click", () => {
        const userToInvite = inviteName.value;
        if (!userToInvite) {
            alert("Please enter in a username.");
        } else {
            inviteHandler(letterCount);
        }
    });
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

    const letterCount = parseInt(numLettersSelect.value);
    if (solo) {
        solo.addEventListener("click", () => {
            soloHandler(letterCount);
        });
    }
    if (match) {
        match.addEventListener("click", () => {
            matchHandler(letterCount);
        });
    }

    if (inviteHandler) {
        setupInviteHandler(inviteHandler, letterCount);
    }
};

const displaySelectOptions = () => {
    return `
        <select id="numLettersSelect">
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
        ? '<button id="match">Match</button>'
        : "<i>Log in or create an account to match against others.</i>";

    return `
        ${displaySelectOptions()}
        <div class="gameButtons">
            <button id="solo">Solo</button>
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
        ${displaySelectOptions()}
        <div class="gameButtons">
            <button id="match">Random Match</button>
            <hr class="hr">
            <h4>Invite a Friend</h4>
            <input type="text" id="inviteName" placeholder="Username to invite">
            <button id="invite">Invite</button>
        </div>
    `;

    setupClickHandlers(newMatch, null, matchHandler, inviteHandler);
    document.body.appendChild(newMatch);
    setTimeout(() => newMatch.classList.add("active"), 1);
};

const displayResultsBox = (user, secretWord, soloHandler, matchHandler) => {
    const result = document.createElement("div");
    result.id = "result";
    result.className = "game-popup";
    result.innerHTML = `
        <i>Secret Word:</i>
        <h2 class="secret">${secretWord}</h2>
        
        <h3 id="again">Play Again?</h3>
        ${displayNewGameControls(user)}
    `;

    setupClickHandlers(result, soloHandler, matchHandler);
    document.body.appendChild(result);
    setTimeout(() => result.classList.add("active"), 1);
};

export default {
    calculateVH,
    getResultClass,
    makeGuessLetterBoxes,
    makeNewKeyboardHTML,
    displayWarningBox,
    displayNewGameBox,
    displayMakeMatchBox,
    displayResultsBox,
};
