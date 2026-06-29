const express = require('express');
const router = express.Router();

// Middlewares
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// Controllers
const authController = require('../controllers/authController');
const portfolioController = require('../controllers/portfolioController');
const codingProfilesController = require('../controllers/codingProfilesController');
const chatController = require('../controllers/chatController');
const analyticsController = require('../controllers/analyticsController');
const blogController = require('../controllers/blogController');

// --- AUTH ROUTES ---
router.post('/auth/login', authController.login);
router.post('/auth/update-password', authMiddleware, authController.updatePassword);
router.get('/auth/verify', authMiddleware, authController.verifyToken);

// --- PORTFOLIO ROUTES ---
router.get('/portfolio', portfolioController.getPortfolio);

// Protected Portfolio Mutations
router.put(
  '/portfolio/profile',
  authMiddleware,
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
  ]),
  portfolioController.updateProfile
);
router.put('/portfolio/education', authMiddleware, portfolioController.updateEducation);
router.put('/portfolio/skills', authMiddleware, portfolioController.updateSkills);
router.put('/portfolio/experience', authMiddleware, portfolioController.updateExperience);
router.put('/portfolio/projects', authMiddleware, portfolioController.updateProjects);
router.post(
  '/portfolio/projects/image',
  authMiddleware,
  upload.single('image'),
  portfolioController.uploadProjectImage
);
router.put('/portfolio/certifications', authMiddleware, portfolioController.updateCertifications);
router.put('/portfolio/achievements', authMiddleware, portfolioController.updateAchievements);

// --- CODING PROFILES ---
router.get('/coding-profiles/:platform/:username', codingProfilesController.getProfileStats);

// --- AI ASSISTANT CHAT ---
router.post('/chat', chatController.handleChat);

// --- BLOG ROUTES ---
router.get('/blogs', blogController.getBlogs);
router.post('/blogs', authMiddleware, blogController.createBlog);
router.put('/blogs/:id', authMiddleware, blogController.updateBlog);
router.delete('/blogs/:id', authMiddleware, blogController.deleteBlog);

// --- ANALYTICS & MESSAGES ---
router.post('/analytics/view', analyticsController.trackView);
router.get('/analytics', authMiddleware, analyticsController.getAnalyticsStats);
router.get('/analytics/messages', authMiddleware, analyticsController.getMessages);
router.post('/analytics/messages', analyticsController.submitMessage);
router.delete('/analytics/messages/:id', authMiddleware, analyticsController.deleteMessage);

module.exports = router;
