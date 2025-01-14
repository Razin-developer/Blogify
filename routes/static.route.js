const express = require("express")

const router = express.Router()

router.get('/login', (req , res) => {
  res.render('login', {
    user: req.user
  })
});

router.get('/signup', (req , res) => {
  res.render('signup', {
    user: req.user
  })
});

router.get('/create-blog', (req , res) => {
  res.render('create-blog', {
    user: req.user
  })
});

router.get('/forgot', (req , res) => {
  res.render('forgot', {
    user: req.user
  })
});


module.exports = router