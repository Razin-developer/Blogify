const Blog = require('../models/blog.model');
const User = require('../models/user.model'); // Ensure the user schema is loaded
var mongoose = require('mongoose');

// Handle Blog Creation
const handleBlogCreate = async (req, res) => {
  try {
    const { title, shortDescription, description } = req.body;
    const file = req.file;

    const blog = await Blog.create({
      title,
      shortDescription,
      description,
      createdBy: req.user.id,
      imageUrl: file ? `/images/blog/${file.filename}` : null, // Handle optional file upload
    });

    res.redirect(`/blog/read/${blog._id}`);
  } catch (err) {
    console.error("Error in blog creation:", err);
    res.status(500).send("Error creating the blog. Please try again.");
  }
};

// Handle Blog Reading

const handleBlogRead = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    

    const blog = await Blog.findById(id)
      .populate("createdBy")
      .populate("comments.author");

    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    let blogAdmin = false
    
    console.log(blog);
    if (req.user && blog.createdBy) {
      blogAdmin = req.user.id === String(blog.createdBy._id) // Check if the user is the blog creator
    } else {
      blogAdmin = false
    }

    console.log(blogAdmin);
    console.log(req.user);
    console.log(blog.createdBy);

    for (let i = 0; i < blog.comments.length; i++) {
      blog.comments[i].commentAdmin = req.user ? req.user.id === String(blog.comments[i].author._id) : false
    }

    console.log(blog.comments);
    
    

    res.render("readmore", {
      blog, // Pass the blog object to the view
      user: req.user,
      blogAdmin,
    });
  } catch (err) {
    console.error("Error in blog reading:", err);
    res.status(500).send("Error reading the blog. Please try again.");
  }
};

// Handle Blog Update
const handleBlogUpdate = async (req, res) => {
  try {
    const { id } = req.params; // Blog ID to update
    const { title, shortDescription, description } = req.body;
    const file = req.file;

    // Update the blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        title,
        shortDescription,
        description,
        ...(file && { imageUrl: `/images/blog/${file.filename}` }), // Update imageUrl if a new file is uploaded
      },
      { new: true } // Return the updated document
    );

    if (!updatedBlog) {
      return res.status(404).send("Blog not found");
    }

    res.redirect(`/blog/read/${updatedBlog._id}`);
  } catch (err) {
    console.error("Error in blog update:", err);
    res.status(500).send("Error updating the blog. Please try again.");
  }
};

// Handle Blog Deletion
const handleBlogDelete = async (req, res) => {
  try {
    const { id } = req.params; // Blog ID to delete

    const deletedBlog = await Blog.findByIdAndDelete(id);

    if (!deletedBlog) {
      return res.status(404).send("Blog not found");
    }

    res.redirect("/"); // Redirect to the blogs list or home
  } catch (err) {
    console.error("Error in blog deletion:", err);
    res.status(500).send("Error deleting the blog. Please try again.");
  }
};

// Handle Blog Comment
const handleBlogComment = async (req, res) => {
  try {
    const { id } = req.params; // Blog ID to comment on
    const { author, comment } = req.body;

    // Find the user by their username or another unique identifier
    const user = await User.findOne({ name: req.user.name });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const blog = await Blog.findByIdAndUpdate(
      id,
      {
        $push: {
          comments: {
            comment,
            author: user._id, // Use the ObjectId of the user
          },
        },
      },
      { new: true }
    );

    if (!blog) {
      return res.status(404).send("Blog not found");
    }
    res.redirect(`/blog/read/${blog._id}`);
  } catch (e) {
    console.error(e);
    res.status(500).send("An error occurred");
  }
};

const handleBlogCommentDelete = async (req, res) => {
  try {
    const { blogId, commentId } = req.params;

    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: {
          comments: {
            _id: commentId,
          },
        },
      },
      { new: true }
    );
   console.log(blog);
   res.redirect(`/blog/read/${blog._id}`)
  } catch (e) {
    console.log(e);   
  }
}
   

module.exports = { handleBlogCreate, handleBlogRead, handleBlogUpdate, handleBlogDelete, handleBlogComment, handleBlogCommentDelete };
