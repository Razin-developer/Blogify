const express = require("express")
const { handleUserGoogleLogin } = require('../controllers/auth.controller.js');
const passport = require("passport");

const router = express.Router()

router.get('/google/auth', passport.authenticate('google', {scope: ['profile', 'email']}));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/'}), handleUserGoogleLogin);

module.exports = router