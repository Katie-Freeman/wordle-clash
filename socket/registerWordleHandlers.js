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


    // TO SOLVE: Duplicate letter in guess that appears once in answer
    // With second placement being in correct position.
    // EX: guess = level  || answer = bevel
    // Current logic would produce [yellow, green, green, green, green]
    // Correct result would be [black, green, green, green, green]
    const evaluateGuessSpecifics = (guess) => {
        letters = guess.split("");
        let processedLetters = ''
        const resMap = letters.map((letter, index) => {
            let result;
            // logic to verify duplicate letters in guess and secret word
            // need to not mark the same letter as yellow twice if only one is present
            if (processedLetters.includes(letter)) {
                // split will produce one extra segment than the number of occurences of the splitter
                const letterAppearance = socket.secretWord.split(letter) - 1;
                const countSoFar = processedLetters.split(letter) - 1;
                if (countSoFar < letterAppearance) {
                    result = "yellow";
                } else {
                    result = "black";
                }
            } else {
                if (letter === socket.secretWord[index]) {
                    result =  "green";
                } else if (socket.secretWord.includes(letter)) {
                    result =  "yellow";
                } else {
                    result =  "black";
                }
            }

            processedLetters += letter;
            return result;
        }, );

        socket.emit("guess-results", { results: resMap });
    };

    socket.on("new-game", (data) => {
        console.log(data);
        // socketUser.gameMode = data.gameMode;
        socket.numLetters = data.numLetters;
        socket.secretWord = generateSecretWord(data.numLetters);
        socket.emit("secret-word", { word: socket.secretWord });
    });

    socket.on("guess", (data) => {
        const guess = data.guess.trim();
        if (!words[socket.numLetters].includes(guess)) {
            return socket.emit("invalid-guess");
        } else if (guess === socket.secretWord) {
            return socket.emit("correct-word");
        } else {
            evaluateGuessSpecifics(guess);
        }
    });
};

module.exports = registerWordleHandlers;
