const jwt = require("jsonwebtoken")
const secret = "razinrichu123"

function setToken (user) {
  const { _id , name , email , role } = user
  return jwt.sign({
    id: _id,
    name,
    email,
    role,
  }, secret)
}

function getPayload (token) {
  return jwt.verify(token, secret)
}

module.exports = {
  setToken,
  getPayload
}