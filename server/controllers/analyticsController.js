const db = require('../models/db');

exports.trackView = async (req, res) => {
  try {
    const { country, projectId } = req.body;
    const analytics = await db.getAnalytics();

    // Increment total views
    analytics.totalViews = (analytics.totalViews || 0) + 1;

    // Track country
    if (country) {
      analytics.countryViews = analytics.countryViews || {};
      analytics.countryViews[country] = (analytics.countryViews[country] || 0) + 1;
    }

    // Track project views if viewing a specific project detail
    if (projectId) {
      analytics.projectViews = analytics.projectViews || {};
      analytics.projectViews[projectId] = (analytics.projectViews[projectId] || 0) + 1;
    }

    // Track daily views (last 30 days)
    const todayStr = new Date().toISOString().split('T')[0];
    analytics.dailyViews = analytics.dailyViews || [];
    
    const dayRecordIndex = analytics.dailyViews.findIndex(d => d.date === todayStr);
    if (dayRecordIndex !== -1) {
      analytics.dailyViews[dayRecordIndex].count += 1;
    } else {
      analytics.dailyViews.push({ date: todayStr, count: 1 });
      // Keep last 30 days
      if (analytics.dailyViews.length > 30) {
        analytics.dailyViews.shift();
      }
    }

    await db.updateAnalytics(analytics);
    return res.status(200).json({ message: 'View tracked successfully', totalViews: analytics.totalViews });
  } catch (err) {
    return res.status(500).json({ message: 'Error tracking view', error: err.message });
  }
};

exports.getAnalyticsStats = async (req, res) => {
  try {
    const stats = await db.getAnalytics();
    const messages = await db.getMessages();
    
    return res.status(200).json({
      analytics: stats,
      messageCount: messages.length
    });
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching analytics stats', error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await db.getMessages();
    return res.status(200).json(messages);
  } catch (err) {
    return res.status(500).json({ message: 'Error retrieving messages', error: err.message });
  }
};

exports.submitMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    const saved = await db.addMessage({ name, email, subject: subject || 'No Subject', message });
    return res.status(201).json({ message: 'Message sent successfully!', data: saved });
  } catch (err) {
    return res.status(500).json({ message: 'Error sending message', error: err.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteMessage(id);
    return res.status(200).json({ message: 'Message deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting message', error: err.message });
  }
};
