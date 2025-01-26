const User = require("../models/user.model");
const { setToken } = require("../services/jwt");
const bcrypt = require("bcryptjs");

async function handleUserGoogleLogin(req, res) {
  const email = req.user.emails[0].value;
  const user = await User.findOne({
    email
  });

  const password = Math.floor(100000 + Math.random() * 900000).toString(); // creates a 6-digit number

  if (!user) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      const newUser = await User.create({
        name: req.user.displayName,
        email: email,
        imageUrl: req.user.photos[0].value,
        password: hash
      });
      const token = setToken(newUser);
      req.session.token = token;
      req.session.specialAttension = `You created an account through Google. Your password is ${password}`;
      res.redirect("/");
    } catch (error) {
      console.error(error);
      res.render("signup", {
        err: "Error creating account. Please try again."
      });
    }
  } else {
    const token = setToken(user);
    req.session.token = token;
    req.session.specialAttension = `Successfully Logged In`;
    res.redirect("/");
  }
}

module.exports = {
  handleUserGoogleLogin
};
