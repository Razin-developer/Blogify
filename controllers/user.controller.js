const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const { setToken } = require("../services/jwt");
const nodemailer = require("nodemailer");

async function handleUserLogin(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({
    email
  });
  if (!user) return res.render("login", { err: "Invalid Email Address" });
  bcrypt.compare(password, user.password, function (err, result) {
    if (err || !result) return res.render("login", { err: "Invalid Password" });
    if (result) {
      const token = setToken(user);
      req.session.token = token;
      req.session.specialAttension = `Successfully Logged In`;
      console.log(req.session);
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
        err: "Password must be at least 6 characters"
      });
    else if (name.length < 3)
      return res.render("signup", {
        err: "Name must be at least 3 characters"
      });
    else if (email.length < 6)
      return res.render("signup", {
        err: "Email must be at least 6 characters"
      });
    else if (!email.includes("@"))
      return res.render("signup", { err: "Invalid Email Address" });
    else if (await User.findOne({ email }))
      return res.render("signup", { err: "Email Address is already logged" });
    else if (password !== confirm)
      return res.render("signup", {
        err: "Passwords do not match Confirm Password"
      });

    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, hash) {
        if (err) return res.render("signup", { err: "Error creating account" });
        const user = await User.create({
          name,
          email,
          password: hash
        });
        const token = await setToken(user);
        req.session.token = token;
        req.session.specialAttension = `Successfully Created a new account`;
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
  req.session.specialAttension = `Successfully Logged Out`;
  res.redirect("/");
}

async function handleUserdelete(req, res) {
  const { id } = req.user;
  const deleteDetails = await User.findByIdAndDelete(id);
  console.log(deleteDetails);

  req.session.token = null;
  req.session.specialAttension = `Successfully Deleted the account `;
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
    imageUrl: `/images/user/${req.file.filename}`
  });
  console.log(user);
  res.redirect("/user/");
}

async function handleUserForgot(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const password = Math.floor(1000 + Math.random() * 9000); // Generates a random 4-digit number
    console.log("Generated Reset Code:", password);

    const sub = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Password Reset - Blogify</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; text-align: center;">
        <div style="max-width: 500px; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); margin: auto;">
            <h2 style="color: #333;">Reset Your Blogify Password</h2>
            <p style="color: #555;">We received a request to reset your password for your Blogify account.</p>
            <p style="font-size: 16px; font-weight: bold; color: #ff5733;">Your reset code: 
                <span style="background-color: #f8d7da; padding: 5px 10px; border-radius: 5px;">${password}</span>
            </p>
            <p style="color: #555;">Click the button below to reset your password:</p>
            <a href="https://blogify-db65.onrender.com/reset-password" style="
                display: inline-block;
                background-color: #007bff;
                color: #ffffff;
                text-decoration: none;
                padding: 12px 20px;
                font-size: 16px;
                font-weight: bold;
                border-radius: 5px;
                box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
            ">
                Reset Password
            </a>
            <p style="color: #555; margin-top: 20px;">This link will expire in <strong>5 days</strong>. Do not share this email with anyone.</p>
            <p style="font-size: 14px; color: #777;">If you did not request this password reset, you can ignore this email.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #777;">© 2025 Blogify. All Rights Reserved.</p>
        </div>
    </body>
    </html>`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "razinmohammedpt@gmail.com",
        pass: "bhvcrjyicjqiuqkv"
      }
    });

    const mailOptions = {
      from: '"Blogify" <razinmohammedpt@gmail.com>', // Change the sender's name
      to: email,
      subject: "Reset Your Blogify Password",
      html: sub
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error while sending email:", error);
        return res
          .status(500)
          .json({ status: false, message: "Failed to send email" });
      }
      console.log("Email sent: " + info.response);
      return res.status(200).json({ status: true, code: password });
    });
  } catch (error) {
    console.error("Error in handleUserForgot:", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
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
    req.session.resetPassAttension = true;
    res.json({ status: true });
  } else {
    res.end("can't find user with email" + email);
  }
}

async function handleUserReset(req, res) {
  console.log(req.body);
  const { email, password } = req.body;

  if (!password) return res.render("signup", { err: "Password is required" });
  else if (password.length < 6)
    return res.render("signup", {
      err: "Password must be at least 6 characters"
    });

  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, async function (err, hash) {
      if (err) return res.render("signup", { err: "Error creating account" });
      const user = await User.findOneAndUpdate(
        { email },
        {
          $set: {
            password: hash
          }
        }
      );
      if (user) {
        const token = setToken(user);
        req.session.token = token;
        req.session.specialAttension = `You are Successfully reseted the password`;
        res.redirect("/");
      } else {
        res.end("can't find user with email" + email);
      }
    });
  });
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
  handleUserReset
};
