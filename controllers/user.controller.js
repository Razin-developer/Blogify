const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const { setToken } = require("../services/jwt");
const nodemailer = require("nodemailer")

async function handleUserLogin(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({
    email,
  });
  if (!user) return res.render("login", { err: "Invalid Email Address" });
  bcrypt.compare(password, user.password, function (err, result) {
    if (err || !result) return res.render("login", { err: "Invalid Password" });
    if (result) {
      const token = setToken(user);
      req.session.token = token;
      res.redirect("/");
    }
  });
}

async function handleUserSignup(req, res) {
  try {
    const { name, email, password, confirm } = req.body;
    if (!name || !email || !password)
      return res.render("signup", { err: "All fields are required" });
    else if (password.length < 6)
      return res.render("signup", {
        err: "Password must be at least 6 characters",
      });
    else if (name.length < 3)
      return res.render("signup", {
        err: "Name must be at least 3 characters",
      });
    else if (email.length < 6)
      return res.render("signup", {
        err: "Email must be at least 6 characters",
      });
    else if (!email.includes("@"))
      return res.render("signup", { err: "Invalid Email Address" });
    else if (await User.findOne({email}))
      return res.render("signup", { err: "Email Address is already logged" });
    else if (password !== confirm)
      return res.render("signup", { err: "Passwords do not match Confirm Password" });

    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, hash) {
        if (err) return res.render("signup", { err: "Error creating account" });
        const user = await User.create({
          name,
          email,
          password: hash,
        });
        const token = await setToken(user);
        req.session.token = token;
        res.redirect("/");
      });
    });
  } catch (error) {
    console.log(error.code);
    if (error.code === 11000) {
      console.log(error.code);
      return res.render("signup", { err: "Email Address is already logged" });
    }
    console.log(error);
  }
}

async function handleUserLogout(req, res) {
  req.session.token = null;
  res.redirect("/");
}

async function handleUserdelete(req, res) {
  const { id } = req.user;
  const deleteDetails = await User.findByIdAndDelete(id);
  console.log(deleteDetails);

  req.session.token = null;
  res.redirect("/");
}

async function handleUserView(req, res) {
  const { id } = req.user;
  const user = await User.findById(id);
  console.log(user);

  res.render("profile", { user });
}

async function handleUserUpdateImage(req, res) {
  const { id } = req.user;
  const user = await User.findByIdAndUpdate(id, {
    imageUrl: `/images/user/${req.file.filename}`,
  });
  console.log(user);
  res.redirect("/user/");
}

async function handleUserForgot(req, res) {
  const { email } = req.body;
  const user = await User.findOne({ email });
  console.log(user);
  const password = Math.floor(1000 + Math.random() * 9000); // Generates a random 4-digit number
  console.log(password);
  
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "razinmohammedpt@gmail.com",
      pass: "bhvcrjyicjqiuqkv",
    },
  });

  var mailOptions = {
    from: "razinmohammedpt@gmail.com",
    to: email,
    subject: "Get Your Code",
    text: `your code is ${password}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error("Error while sending email:", error);
      return res.status(500).json({ status: false, message: "Failed to send email" });
    } else {
      console.log("Email sent: " + info.response);
      return res.status(200).json({ status: true, code: password });
    }
  });
  
  res.json({ status: true, code: password });
}

async function handleUserForgotSuccess(req, res) {
  console.log(req.body);
  
  const { email } = req.body;
  const user = await User.findOne({ email });
  console.log(email);
  console.log(user);
  if (user) {
    const token = setToken(user);
    req.session.token = token;
    res.json({status: true});
  } else {
    res.end("can't find user with email" + email)
  }
}

module.exports = {
  handleUserLogin,
  handleUserSignup,
  handleUserLogout,
  handleUserdelete,
  handleUserView,
  handleUserUpdateImage,
  handleUserForgot,
  handleUserForgotSuccess,
};
