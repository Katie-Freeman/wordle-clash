const letterCountMiddleware = (req, res, next) => {
    let letterCount = 4;
    if (req.session && req.session.lastLetterCount) {
        letterCount = req.session.lastLetterCount;
    }
    const letterBoxes = new Array(letterCount).fill(".");
    res.locals.boxes = letterBoxes;

    if (req.session && req.session.username) {
        res.locals.username = req.session.username;
    }
    next();
};

module.exports = letterCountMiddleware;
