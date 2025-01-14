const User = require("../models/user.model");
const { setToken } = require("../services/jwt");
const bcrypt = require('bcrypt')

async function handleUserGoogleLogin(req, res) {
  const email = req.user.emails[0].value;
  const user = await User.findOne({
    email,
  });
  if (!user) {
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash("123456", salt, async function (err, hash) {
        if (err) return res.render("signup", { err: "Error creating account" });
        const newUser = await User.create({
          name: req.user.displayName,
          email: email,
          imageUrl: req.user.photos[0].value,
          password: hash
        });
        const token = setToken(newUser);
        req.session.token = token;
        req.session.specialAttension = "You are Logged Through Google. So, your password is 123456";
        res.redirect("/");
      });
    });
  } else {
    const token = setToken(user);
    req.session.token = token;
    res.redirect("/");
  }
}

module.exports = {
  handleUserGoogleLogin,
};
