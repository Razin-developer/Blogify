const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const logger = require("morgan");
const hbs = require('hbs')
const path = require('path')
require('dotenv').config()

const authorize = require("./middlewares/authorize.middleware.js")
const authenticate = require("./middlewares/authenticate.middleware.js")
const userRoute = require("./routes/user.route.js")
const staticRoute = require("./routes/static.route.js")
const blogRoute = require("./routes/blog.route.js");
const Blog = require("./models/blog.model.js");


const app = express();
const PORT = process.env.PORT || 8000

// view engine setup 
app.set("view engine", "hbs")
app.set('views', path.join(__dirname, 'views'));

// MongoDB connection URL
const mongoURI = process.env.MONGO_URI; // Replace with your MongoDB URI

// Connect to MongoDB
mongoose
  .connect(mongoURI, 
    { useNewUrlParser: true,
      useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'))

// Session setup
app.use(
  session({
    secret: "razinrichu123", // A secret key used for signing the session ID cookie
    resave: false,
    saveUninitialized: false, // Prevents saving uninitialized sessions
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 15, secure: false, httpOnly: true } // Sets the cookie expiration time in milliseconds
  })
);


hbs.registerPartials(path.join(__dirname, '/views/partials'));

app.use(authenticate)

app.get('/', async (req , res) => {
  const blogs = await Blog.find({}).sort({ createdAt: -1 })
  console.log(blogs);
  
  return res.render('home', {
    user: req.user,
    blogs
  })
});

app.use('/', staticRoute)
app.use('/user', userRoute)
app.use('/blog', blogRoute)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});