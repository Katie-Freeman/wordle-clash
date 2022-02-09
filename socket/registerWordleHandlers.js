const words = require("./words/words");
const models = require("../models");

let connectedUsers = [];
const usersLookingForMatch = [];

const registerWordleHandlers = (io, socket) => {
    const { session } = socket.request;
    let socketUser = {};
    let user;

    if (session) {
        if (!session.socketUser) {
            session.socketUser = {
                sessionId: session.id,
            };
        }

        if (session.user) {
            user = session.user.name;
            connectedUsers.push(user);
        }
        socketUser = session.socketUser;
        session.save();
    }

    socket.emit("user-info", { user });

    const generateSecretWord = (numLetters) => {
        const wordCount = words[numLetters].length;
        const randomIndex = Math.floor(Math.random() * wordCount);
        return words[numLetters][randomIndex];
    };

    const getMatchesInWord = (word, letter) => {
        const matches = [...word.matchAll(letter)];
        return matches.map((match) => match.index);
    };

    const handleLoss = async () => {
        if (session.user) {
            if (socketUser.gameMode === "solo") {
                const stat = models.SoloStat.build({
                    user_id: session.user.userId,
                    letterCount: socket.numLetters,
                    guesses: 6,
                    win: false,
                });

                await stat.save();
            }
        }
    };

    const evaluateGuessSpecifics = (guess, count) => {
        letters = guess.split("");
        const results = new Array(socket.numLetters).fill("");
        for (let i = 0; i < guess.length; i++) {
            // if not blank, this was matched in an earlier iteration to check if duplicate
            // letter was in correct position later within word
            if (results[i]) {
                continue;
            }

            const letter = guess[i];
            if (letter === socket.secretWord[i]) {
                results[i] = "in-place";
            } else if (socket.secretWord.includes(letter)) {
                // Need to properly account for duplicates of letter
                // check number of times letter is in answer and in guess
                const answerMatches = getMatchesInWord(
                    socket.secretWord,
                    letter
                );
                const guessMatches = getMatchesInWord(guess, letter);
                const linedUpMatches = answerMatches.filter((match) =>
                    guessMatches.includes(match)
                );

                // make duplicates later in iteration green if at proper index
                linedUpMatches.forEach((matchIndex) => {
                    results[matchIndex] = "in-place";
                });

                // factor out indices and counts of lined up match,
                // while remaining answers above 0, assign result[i] = "yellow", then "black"
                let remainingAnswers = answerMatches.filter(
                    (match) => !linedUpMatches.includes(match)
                ).length;
                const remainingGuessIndices = guessMatches.filter(
                    (match) => !linedUpMatches.includes(match)
                );
                remainingGuessIndices.forEach((guessIndex) => {
                    if (remainingAnswers > 0) {
                        remainingAnswers--;
                        results[guessIndex] = "out-of-place";
                    } else {
                        results[guessIndex] = "not-in-word";
                    }
                });
            } else {
                results[i] = "not-in-word";
            }
        }
        const socketData = { results };
        if (count === 6) {
            socketData.secretWord = socket.secretWord;
            handleLoss();
        }

        socket.emit("guess-results", socketData);
    };

    const handleWordGuessed = async (count) => {
        if (session.user) {
            if (socketUser.gameMode === "solo") {
                console.log(socket.numLetters);
                const stat = models.SoloStat.build({
                    user_id: session.user.userId,
                    letterCount: socket.numLetters,
                    guesses: count,
                    win: true,
                });
                await stat.save();
            }
        }
        socket.emit("correct-word");
    };

    const startSoloGame = () => {
        socket.secretWord = generateSecretWord(socket.numLetters);
        socket.emit("secret-word", { secret: "Secret Word Ready" });
    };

    socket.on("new-game", (data) => {
        socketUser.gameMode = data.gameMode;
        socket.numLetters = parseInt(data.numLetters);
        session.lastLetterCount = socket.numLetters;
        session.save();
        switch (socketUser.gameMode) {
            case "solo":
                startSoloGame();
                break;
            default:
                startSoloGame();
        }
    });

    socket.on("guess", (data) => {
        const guess = data.guess.trim();
        const guessCount = parseInt(data.count);
        if (
            !words[socket.numLetters].includes(guess) ||
            guess.length < socket.numLetters
        ) {
            socket.emit("invalid-guess");
        } else if (guess === socket.secretWord) {
            handleWordGuessed(guessCount);
        } else {
            evaluateGuessSpecifics(guess, guessCount);
        }
    });

    socket.on("disconnect", () => {
        if (session.user) {
            connectedUsers = connectedUsers.filter(
                (user) => user !== session.user.name
            );
        }
    });
};

module.exports = registerWordleHandlers;
