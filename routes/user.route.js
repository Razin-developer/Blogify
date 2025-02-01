const express = require("express");
const {
  handleUserLogin,
  handleUserSignup,
  handleUserLogout,
  handleUserdelete,
  handleUserView,
  handleUserUpdateImage,
  handleUserForgot,
  handleUserForgotSuccess,
  handleUserReset
} = require("../controllers/user.controller.js");
const authorize = require("../middlewares/authorize.middleware.js");
const upload = require("../middlewares/upload-profile.middleware.js");

const router = express.Router();

router.post("/login", handleUserLogin);

router.post("/signup", handleUserSignup);

router.get("/logout", authorize, handleUserLogout);

router.get("/delete", authorize, handleUserdelete);

router.get("/", authorize, handleUserView);

router.post(
  "/update-image",
  authorize,
  upload.single("profileImage"),
  handleUserUpdateImage
);

router.post("/forgot", handleUserForgot);

router.post("/forgot/success", handleUserForgotSuccess);

router.post("/reset", handleUserReset);

module.exports = router;
