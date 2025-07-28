function checarLogin(req, res, next) {
  if (req.session.logado) {
    return next();
  }
  return res.status(401).send('Faça login');
}

module.exports = checarLogin;