const User = require("../models/user.model");
const { setToken } = require("../services/jwt");

async function handleUserGoogleLogin(req, res) {
  const email = req.user.emails[0].value;
  const user = await User.findOne({
    email,
  });
  if (!user) {
    const newUser = await User.create({
      name: req.user.displayName,
      email: email,
      imageUrl: req.user.photos[0].value,
    });
    const token = setToken(newUser);
    req.session.token = token;
    res.redirect("/");
  } else {
    const token = setToken(user);
    req.session.token = token;
    res.redirect("/");
  }
}

module.exports = {
  handleUserGoogleLogin,
};