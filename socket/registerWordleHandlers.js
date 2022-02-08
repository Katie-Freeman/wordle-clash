const words = require("./words/words");

const connectedUsers = [];
const usersLookingForMatch = [];

const registerWordleHandlers = (io, socket) => {
    let socketUser;

    if (socket.request.session) {
        if (!socket.request.session.socketUser) {
            socket.request.session.socketUser = {
                sessionId: socket.request.session.id,
                name: socket.request.session.username,
            };

            socketUser = socket.request.session.socketUser
        }
    }

    console.log(socketUser)
    const generateSecretWord = (numLetters) => {
        const wordCount = words[numLetters].length;
        const randomIndex = Math.floor(Math.random() * wordCount);
        return words[numLetters][randomIndex];
    };

    const getMatchesInWord = (word, letter) => {
        const matches = [...word.matchAll(letter)];
        return matches.map(match => match.index);
    }

    const evaluateGuessSpecifics = (guess, count) => {
        letters = guess.split("");
        const results = new Array(socket.numLetters).fill('');
        for (let i = 0; i < guess.length; i++) {
            // if not blank, this was matched in an earlier iteration to check if duplicate
            // letter was in correct position later within word
            if (results[i]) {
                continue;
            }

            const letter = guess[i];
            if (letter === socket.secretWord[i]) {
                results[i] = 'in-place';
            } else if (socket.secretWord.includes(letter)) {
                // Need to properly account for duplicates of letter
                // check number of times letter is in answer and in guess
                const answerMatches = getMatchesInWord(socket.secretWord, letter);
                const guessMatches = getMatchesInWord(guess, letter);
                const linedUpMatches = answerMatches.filter(match => guessMatches.includes(match))
                
                // make duplicates later in iteration green if at proper index
                linedUpMatches.forEach(matchIndex => {
                    results[matchIndex] = 'in-place';
                })

                // factor out indices and counts of lined up match,
                // while remaining answers above 0, assign result[i] = "yellow", then "black"
                let remainingAnswers = answerMatches.filter(match => !linedUpMatches.includes(match)).length;
                const remainingGuessIndices = guessMatches.filter(match => !linedUpMatches.includes(match));
                remainingGuessIndices.forEach(guessIndex => {
                    if (remainingAnswers > 0) {
                        remainingAnswers--;
                        results[guessIndex] = "out-of-place";
                    } else {
                        results[guessIndex] = "not-in-word"
                    }
                })
            } else {
                results[i] = 'not-in-word'
            }
        }
        const socketData = { results };
        if (count === 6) {
            socketData.secretWord = socket.secretWord;
        }

        socket.emit("guess-results", socketData);
    };

    const handleWordGuessed = async() => {
        // handle db calls
        socket.emit("correct-word");
    }

    const startSoloGame = () => {
        socket.secretWord = generateSecretWord(socket.numLetters);
        socket.emit("secret-word", { secret: "Secret Word Ready" });
    }

    socket.on("new-game", (data) => {
        socketUser.gameMode = data.gameMode;
        socket.numLetters = parseInt(data.numLetters);
        switch (socketUser.gameMode) {
            case 'solo':
                startSoloGame();
                break;
            default:
                startSoloGame();
        }
    });

    socket.on("guess", (data) => {
        const guess = data.guess.trim();
        const guessCount = parseInt(data.count);
        if (!words[socket.numLetters].includes(guess) || guess.length < socket.numLetters) {
            socket.emit("invalid-guess");
        } else if (guess === socket.secretWord) {
            handleWordGuessed();
        } else {
            evaluateGuessSpecifics(guess, guessCount);
        }
    });
};

module.exports = registerWordleHandlers;
