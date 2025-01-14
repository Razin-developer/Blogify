const Blog = require("../models/blog.model");

async function specialAdminCheck(req, res, next) {
  const blogId = req.params.id;
  const userId = req.user.id;
  const blog = await Blog.findById(blogId);
  if (userId === blog.createdBy.toString()) {
    return next();
  }
  return res.status(403).send("You are not authorized to update this blog");
}

module.exports = specialAdminCheck;