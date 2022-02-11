const words = require("./words/words");
const models = require("../models");
const { Op } = require("sequelize");

const registerWordleHandlers = (io, socket) => {
    const { session } = socket.request;
    let user;

    if (session) {
        if (!session.socketUser) {
            session.socketUser = {
                sessionId: session.id,
            };
        }

        if (session.user) {
            user = { name: session.user.name, id: socket.id };
            socket.user = user.name;
            socket.acctId = session.user.userId;
            io.connectedUsers.push(user);
        }
        socketUser = session.socketUser;
        session.save();
    }
    socket.gameMode = "solo";
    socket.inMatch = false;
    socket.opponent = null;
    socket.stats = { count: 0, wordGuessed: false, lastGuess: null };
    socket.room = null;

    socket.emit("user-info", { user });

    const getSocketUser = (id) => {
        return io.sockets.get(id);
    };

    const isOpponentDone = () => {
        const { stats } = socket.opponent;
        return stats.count === 6 || stats.wordGuessed;
    };

    const resetMatchState = () => {
        socket.inMatch = false;
        socket.opponent = null;
        socket.room = null;
        socket.stats = { count: 0, wordGuessed: false, lastGuess: null };
    };

    const processGuessCount = (lastGuess) => {
        const inPlaceLetters = lastGuess.filter(
            (guess) => guess === "in-place"
        );
        const lettersInWord = lastGuess.filter(
            (guess) => guess !== "not-in-word"
        );
        return {
            inPlace: inPlaceLetters.length,
            inWord: lettersInWord.length,
        };
    };

    const trimStatObjectForDb = (stat) => {
        return {
            userId: stat.userId,
            guessCount: stat.guessCount,
            wordGuessed: stat.wordGuessed,
            lastResult: stat.lastGuess,
        };
    };

    const processEndMatch = async () => {
        /*  
            if this socket is running this function, then opponent finished first
            (triggered by noticing other player already finished when is finished)
            1. winner is determined by fewest guesses to correct word,
            2. followed by who guessed correctly first,
            3. If only one user guesses correctly, that user wins
            
            If neither player guesses correctly:
            1. Most in-place letters on last incorrect guess,
            2. followed by most letters from word on last incorrect guess
            3. if all the above are equal, opponent wins for reaching the end first
        */

        const userStats = socket.stats;
        const opStats = socket.opponent.stats;
        let userIsWinner;

        if (userStats.wordGuessed && opStats.wordGuessed) {
            // This socket has to have a lower count to win
            // If the counts are the same, opponent wins due to guessing correctly first
            userIsWinner = userStats.count < opStats.count ? true : false;
        } else if (userStats.wordGuessed && !opStats.wordGuessed) {
            userIsWinner = true;
        } else if (opStats.wordGuessed && !userStats.wordGuessed) {
            userIsWinner = false;
        } else {
            const userCounts = processGuessCount(userStats.lastGuess);
            const opCounts = processGuessCount(opStats.lastGuess);

            if (userCounts.inPlace === opCounts.inPlace) {
                userIsWinner =
                    userCounts.inWord > opCounts.inWord ? true : false;
            } else {
                userIsWinner =
                    userCounts.inPlace > opCounts.inPlace ? true : false;
            }
        }

        const winnerId = userIsWinner ? socket.acctId : socket.opponent.acctId;
        const winner = userIsWinner ? socket.user : socket.opponent.user;

        const userStatToSend = {
            userId: socket.acctId,
            name: socket.user,
            guessCount: userStats.count,
            wordGuessed: userStats.wordGuessed,
            lastResult: userStats.lastGuess,
            isFirstToComplete: false,
        };

        const opStatToSend = {
            userId: socket.opponent.acctId,
            name: socket.opponent.user,
            guessCount: opStats.count,
            wordGuessed: opStats.wordGuessed,
            lastResult: opStats.lastGuess,
            isFirstToComplete: true,
        };
        const matchStat = models.MatchStat.build({
            winner: winnerId,
            letterCount: socket.numLetters,
            users: [
                trimStatObjectForDb(userStatToSend),
                trimStatObjectForDb(opStatToSend),
            ],
        });

        await matchStat.save();
        io.to(socket.room).emit("match-result", {
            winner,
            secretWord: socket.secretWord,
            stats: [userStatToSend, opStatToSend],
        });
    };

    const buildSoloStat = async (count, didWin) => {
        const stat = models.SoloStat.build({
            user_id: session.user.userId,
            letterCount: socket.numLetters,
            guesses: count,
            win: didWin,
        });
        await stat.save();
    };

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
            if (socket.gameMode === "solo") {
                await buildSoloStat(6, false);
                resetMatchState();
            } else {
                socket.emit("word-failed-waiting", {
                    lastGuess: socket.stats.lastGuess,
                });

                if (isOpponentDone()) {
                    processEndMatch();
                }

                socket
                    .to(socket.room)
                    .emit("opponent-out", { username: socket.user });
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

        if (socket.room) {
            socket.stats = {
                ...socket.stats,
                count,
                lastGuess: results,
            };
            io.to(socket.room).emit("opponent-guess-results", {
                results,
                count,
                username: socket.user,
            });
        }

        if (count === 6) {
            socketData.secretWord = socket.secretWord;
            handleLoss();
        }

        if (count < 6 || socket.gameMode === "solo") {
            socket.emit("guess-results", socketData);
        }
    };

    const handleWordGuessed = async (count) => {
        if (session.user) {
            if (socket.gameMode === "solo") {
                await buildSoloStat(count, true);
                resetMatchState();
                socket.emit("correct-word");
            } else {
                socket.stats = {
                    ...socket.stats,
                    count,
                    wordGuessed: true,
                    lastGuess: new Array(socket.numLetters).fill("in-place"),
                };
                socket.emit("word-guessed-waiting");

                if (isOpponentDone()) {
                    processEndMatch();
                }

                io.to(socket.room).emit("opponent-guessed-word", {
                    username: socket.user,
                    count,
                });
            }
        }
    };

    const startSoloGame = () => {
        socket.secretWord = generateSecretWord(socket.numLetters);
        socket.inMatch = false;
        socket.emit("secret-word-ready");
    };

    const startMatchedGame = (opponent, mode) => {
        socket.secretWord = generateSecretWord(socket.numLetters);
        opponent.secretWord = socket.secretWord;
        [socket, opponent].forEach((userSocket) => {
            userSocket.inMatch = true;
            userSocket.gameMode = mode;
            userSocket.room = socket.user;
            userSocket.numLetters = socket.numLetters;
            // Send self socket and opponent socket to room to emit shared messages from
            userSocket.join(socket.user);
        });

        socket.opponent = opponent;
        opponent.opponent = socket;
        opponent.emit("secret-word-ready", {
            name: socket.user,
            numLetters: socket.numLetters,
        });
        socket.emit("secret-word-ready", {
            name: opponent.user,
            numLetters: socket.numLetters,
        });
    };

    const submitForMatchup = () => {
        if (!socket.user) return;
        if (io.usersLookingForMatch.length > 0) {
            const targetUser = io.usersLookingForMatch[0];
            const userSocket = getSocketUser(targetUser.id);
            io.usersLookingForMatch = io.usersLookingForMatch.filter(
                (user) => user.id !== targetUser.id
            );
            userSocket.emit("user-found");
            socket.emit("user-found");
            startMatchedGame(userSocket, "match");
        } else {
            io.usersLookingForMatch.push(user);
            socket.emit("waiting");
        }
    };

    const initiateInvitationMatch = async (username) => {
        if (!socket.user) return;
        const targetUser = io.connectedUsers.find(
            (user) => user.name === username
        );
        if (targetUser) {
            const userSocket = getSocketUser(targetUser.id);
            if (userSocket.inMatch) {
                socket.emit("user-busy");
            } else {
                socket.emit("user-found");
                userSocket.emit("match-request", {
                    username: socket.user,
                    numLetters: socket.numLetters,
                });
            }
        } else {
            const user = await models.User.findOne({
                where: {
                    name: {
                        [Op.iLike]: username,
                    },
                },
            });

            let message = "Cannot find player in our database.";
            if (user) {
                message = "Player not online.";
            }

            socket.emit("unable-to-match", { message });
        }
    };

    socket.on("new-game", (data) => {
        socket.gameMode = data.gameMode;
        socket.numLetters = parseInt(data.numLetters);
        session.lastLetterCount = socket.numLetters;
        session.save();
        switch (socket.gameMode) {
            case "solo":
                startSoloGame();
                break;
            case "match":
                socket.numLetters = Math.floor(Math.random() * 4) + 4;
                submitForMatchup();
                break;
            case "invite":
                initiateInvitationMatch(data.username);
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

    socket.on("accept-request", (data) => {
        socket.numLetters = data.numLetters;
        const targetUser = io.connectedUsers.find(
            (user) => user.name === data.username
        );
        const userSocket = getSocketUser(targetUser.id);
        startMatchedGame(userSocket, "invite");
    });

    socket.on("reject-request", (data) => {
        const targetUser = io.connectedUsers.find(
            (user) => user.name === data.username
        );
        const userSocket = getSocketUser(targetUser.id);
        userSocket.emit("reject-request");
    });

    socket.on("confirm-disconnect", () => {
        resetMatchState();
    });

    socket.on("disconnect", () => {
        if (session.user) {
            io.connectedUsers = io.connectedUsers.filter(
                (user) => user.name !== session.user.name
            );
        }
        if (socket.room) {
            io.to(socket.room).emit("opponent-disconnected");
        }
    });
};

module.exports = registerWordleHandlers;
