const { Schema, model } = require("mongoose");

const blogSchema = new Schema(
  {
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Correct ref
    comments: [
      {
        comment: { type: String, required: true },
        author: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Correct ref
      },
    ],
  },
  { timestamps: true }
);

const Blog = model("blog", blogSchema);

module.exports = Blog;
