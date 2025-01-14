function authorize(req, res, next) {
  const { user } = req;
  try {
    if (user) {
      next()
    } else {
      res.redirect("/login")
    }
  } catch (e) {
    console.log("error in authorize", e)
  }
}

module.exports = authorize
