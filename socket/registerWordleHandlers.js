const registerTournamentHandlers = require("./registerTournamentHandlers");
const words = require("./words/words");

const registerWordleHandlers = (io, socket) => {

    // session isn't attaching on test.html (maybe doesn't run through other middleware on static pages?)
    if (socket.request.session) {
        if (!socket.request.session.socketUser) {
            socket.request.session.socketUser = {
                sessionId: socket.request.session.id,
                name: socket.request.session.username,
            };

            const { socketUser } = socket.request.session;
        }
    }

    const generateSecretWord = (numLetters) => {
        const wordCount = words[numLetters].length;
        const randomIndex = Math.floor(Math.random() * wordCount);
        return words[numLetters][randomIndex];
    };

    const getMatchesInWord = (word, letter) => {
        const matches = [...word.matchAll(letter)];
        return matches.map(match => match.index);
    }

    const evaluateGuessSpecifics = (guess) => {
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
                results[i] = 'green';
            } else if (socket.secretWord.includes(letter)) {
                // Need to properly account for duplicates of letter
                // check number of times letter is in answer and in guess
                const answerMatches = getMatchesInWord(socket.secretWord, letter);
                const guessMatches = getMatchesInWord(guess, letter);
                const linedUpMatches = answerMatches.filter(match => guessMatches.includes(match))
                
                // make duplicates later in iteration green if at proper index
                linedUpMatches.forEach(matchIndex => {
                    results[matchIndex] = 'green';
                })

                // factor out indices and counts of lined up match,
                // while remaining answers above 0, assign result[i] = "yellow", then "black"
                let remainingAnswers = answerMatches.filter(match => !linedUpMatches.includes(match)).length;
                const remainingGuessIndices = guessMatches.filter(match => !linedUpMatches.includes(match));
                remainingGuessIndices.forEach(guessIndex => {
                    if (remainingAnswers > 0) {
                        remainingAnswers--;
                        results[guessIndex] = "yellow";
                    } else {
                        results[guessIndex] = "black"
                    }
                })
            } else {
                results[i] = 'black'
            }
        }

        socket.emit("guess-results", { results });
    };

    socket.on("new-game", (data) => {
        // socketUser.gameMode = data.gameMode;
        socket.numLetters = parseInt(data.numLetters);
        socket.secretWord = generateSecretWord(data.numLetters);
        socket.emit("secret-word", { word: socket.secretWord });
    });

    socket.on("guess", (data) => {
        const guess = data.guess.trim();
        if (!words[socket.numLetters].includes(guess) || guess.length < socket.numLetters) {
            return socket.emit("invalid-guess");
        } else if (guess === socket.secretWord) {
            return socket.emit("correct-word");
        } else {
            evaluateGuessSpecifics(guess);
        }
    });
};

module.exports = registerWordleHandlers;
