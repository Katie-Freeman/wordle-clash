function authenticateMiddleware(req, res, next) {
  if (req.session) {
    if (req.session.user) {
      res.locals.authenticateMiddleware = true;
      next();
    } else {
      res.redirect("/");
    }
  } else {
    res.redirect("/");
  }
}

module.exports = authenticateMiddleware;
