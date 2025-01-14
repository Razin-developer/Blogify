require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const logger = require("morgan");
const hbs = require("hbs");
const path = require("path");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const authenticate = require("./middlewares/authenticate.middleware.js");
const userRoute = require("./routes/user.route.js");
const staticRoute = require("./routes/static.route.js");
const blogRoute = require("./routes/blog.route.js");
const authRoute = require("./routes/auth.route.js");
const Blog = require("./models/blog.model.js");

const app = express();
const PORT = process.env.PORT || 8000;

// view engine setup
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// MongoDB connection URL
const mongoURI = process.env.MONGO_URI; // Replace with your MongoDB URI

// Connect to MongoDB
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Session setup
app.use(
  session({
    secret: "razinrichu123", // A secret key used for signing the session ID cookie
    resave: false,
    saveUninitialized: false, // Prevents saving uninitialized sessions
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 15, secure: false, httpOnly: true }, // Sets the cookie expiration time in milliseconds
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

hbs.registerPartials(path.join(__dirname, "/views/partials"));

app.get("/", authenticate, async (req, res) => {
  const blogs = await Blog.find({}).sort({ createdAt: -1 });
  console.log(blogs);

  return res.render("home", {
    user: req.user,
    blogs,
  });
});

app.use("/", authenticate, staticRoute);
app.use("/user", authenticate, userRoute);
app.use("/blog", authenticate, blogRoute);
app.use("/auth", authRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
