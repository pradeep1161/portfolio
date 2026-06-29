const db = require('../models/db');

exports.getBlogs = async (req, res) => {
  try {
    const blogs = await db.getBlogs();
    return res.status(200).json(blogs);
  } catch (err) {
    return res.status(500).json({ message: 'Error retrieving blogs', error: err.message });
  }
};

exports.createBlog = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    if (!title || !content || !category) {
      return res.status(400).json({ message: 'Title, content, and category are required' });
    }

    const blog = await db.addBlog({ title, content, category, tags });
    return res.status(201).json({ message: 'Blog post created successfully', data: blog });
  } catch (err) {
    return res.status(500).json({ message: 'Error creating blog post', error: err.message });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;
    
    const updated = await db.updateBlog(id, { title, content, category, tags });
    if (!updated) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    return res.status(200).json({ message: 'Blog post updated successfully', data: updated });
  } catch (err) {
    return res.status(500).json({ message: 'Error updating blog post', error: err.message });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteBlog(id);
    return res.status(200).json({ message: 'Blog post deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting blog post', error: err.message });
  }
};
