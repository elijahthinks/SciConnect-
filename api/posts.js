const express = require('express');
const cors = require('cors');
const { Post } = require('../models/Post');
const { User } = require('../models/User');
const { sequelize } = require('../db-vercel');

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Initialize database connection
const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected for posts API');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
};

// Get all posts
app.get('/posts', async (req, res) => {
  try {
    await initDB();
    
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new post
app.post('/posts', async (req, res) => {
  try {
    await initDB();
    
    const { title, content, userId } = req.body;
    
    if (!title || !content || !userId) {
      return res.status(400).json({ message: 'Title, content, and userId are required' });
    }

    const post = await Post.create({
      title,
      content,
      userId
    });

    const postWithAuthor = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar']
        }
      ]
    });

    res.status(201).json(postWithAuthor);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Posts API is running' });
});

module.exports = app; 