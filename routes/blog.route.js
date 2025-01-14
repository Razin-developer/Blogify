const express = require("express");
const { handleBlogCreate, handleBlogRead, handleBlogUpdate, handleBlogDelete, handleBlogComment, handleBlogCommentDelete } = require('../controllers/blog.controller.js');
const authorize = require("../middlewares/authorize.middleware.js");
const upload = require("../middlewares/upload.middleware.js");
const specialAdminCheck = require("../middlewares/admin-check.middleware.js");
const Blog = require("../models/blog.model.js");

const router = express.Router()


router.post('/create', authorize, upload.single('image'), handleBlogCreate);

router.get('/read/:id', handleBlogRead);

router.get('/:id/edit', authorize, specialAdminCheck ,async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  console.log(blog);
  
  res.render("update", {
    id: req.params.id,
    blog,
  })
});

router.post('/:id/update', authorize, specialAdminCheck ,upload.single('image'), handleBlogUpdate);

router.delete('/:id/delete', authorize, specialAdminCheck, handleBlogDelete);

router.post('/:id/comment', authorize, handleBlogComment);

router.get('/:blogId/comment/:commentId/delete', authorize, handleBlogCommentDelete);

module.exports = router