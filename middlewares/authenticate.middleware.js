const { setToken , getPayload } = require("../services/jwt.js")

function authenticate(req, res, next) {
  const token = req.session.token;
  req.user = null
  try {
    if (token) {
      const user = getPayload(token)
      req.user = user
    } else {
      return next();
    }
  } catch (e) {
    console.log("error in authenticate", e)
  }
  return next()
}

module.exports = authenticate
