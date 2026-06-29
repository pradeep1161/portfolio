const db = require('../models/db');
const { uploadToCloud } = require('../utils/cloudStorage');

exports.getPortfolio = async (req, res) => {
  try {
    const portfolio = await db.getPortfolio();
    return res.status(200).json(portfolio);
  } catch (err) {
    return res.status(500).json({ message: 'Error retrieving portfolio', error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const portfolio = await db.getPortfolio();
    const profileUpdates = JSON.parse(req.body.profile || '{}');
    
    // Check if avatar or resume was uploaded
    if (req.files) {
      if (req.files.avatar && req.files.avatar[0]) {
        const file = req.files.avatar[0];
        const cloudUrl = await uploadToCloud(file.path, file.originalname, file.mimetype);
        profileUpdates.avatar = cloudUrl;
      }
      
      if (req.files.resume && req.files.resume[0]) {
        const file = req.files.resume[0];
        const cloudUrl = await uploadToCloud(file.path, file.originalname, file.mimetype);
        profileUpdates.resumeUrl = cloudUrl;
      }
    }

    portfolio.profile = { ...portfolio.profile, ...profileUpdates };
    const updated = await db.updatePortfolio(portfolio);
    return res.status(200).json({ message: 'Profile updated successfully', data: updated.profile });
  } catch (err) {
    return res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
};

exports.updateEducation = async (req, res) => {
  try {
    const portfolio = await db.getPortfolio();
    const { education } = req.body; // Array of education items
    if (!Array.isArray(education)) {
      return res.status(400).json({ message: 'Education must be an array' });
    }
    
    portfolio.education = education;
    const updated = await db.updatePortfolio(portfolio);
    return res.status(200).json({ message: 'Education updated successfully', data: updated.education });
  } catch (err) {
    return res.status(500).json({ message: 'Error updating education', error: err.message });
  }
};

exports.updateSkills = async (req, res) => {
  try {
    const portfolio = await db.getPortfolio();
    const { skills } = req.body; // Array of skill items
    if (!Array.isArray(skills)) {
      return res.status(400).json({ message: 'Skills must be an array' });
    }
    
    portfolio.skills = skills;
    const updated = await db.updatePortfolio(portfolio);
    return res.status(200).json({ message: 'Skills updated successfully', data: updated.skills });
  } catch (err) {
    return res.status(500).json({ message: 'Error updating skills', error: err.message });
  }
};

exports.updateExperience = async (req, res) => {
  try {
    const portfolio = await db.getPortfolio();
    const { experience } = req.body;
    if (!Array.isArray(experience)) {
      return res.status(400).json({ message: 'Experience must be an array' });
    }

    portfolio.experience = experience;
    const updated = await db.updatePortfolio(portfolio);
    return res.status(200).json({ message: 'Experience updated successfully', data: updated.experience });
  } catch (err) {
    return res.status(500).json({ message: 'Error updating experience', error: err.message });
  }
};

exports.updateProjects = async (req, res) => {
  try {
    const portfolio = await db.getPortfolio();
    const { projects } = req.body;
    if (!Array.isArray(projects)) {
      return res.status(400).json({ message: 'Projects must be an array' });
    }

    portfolio.projects = projects;
    const updated = await db.updatePortfolio(portfolio);
    return res.status(200).json({ message: 'Projects updated successfully', data: updated.projects });
  } catch (err) {
    return res.status(500).json({ message: 'Error updating projects', error: err.message });
  }
};

exports.uploadProjectImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const file = req.file;
    const cloudUrl = await uploadToCloud(file.path, file.originalname, file.mimetype);
    return res.status(200).json({ url: cloudUrl });
  } catch (err) {
    return res.status(500).json({ message: 'Project image upload failed', error: err.message });
  }
};

exports.updateCertifications = async (req, res) => {
  try {
    const portfolio = await db.getPortfolio();
    const { certifications } = req.body;
    if (!Array.isArray(certifications)) {
      return res.status(400).json({ message: 'Certifications must be an array' });
    }

    portfolio.certifications = certifications;
    const updated = await db.updatePortfolio(portfolio);
    return res.status(200).json({ message: 'Certifications updated successfully', data: updated.certifications });
  } catch (err) {
    return res.status(500).json({ message: 'Error updating certifications', error: err.message });
  }
};

exports.updateAchievements = async (req, res) => {
  try {
    const portfolio = await db.getPortfolio();
    const { achievements } = req.body;
    if (!Array.isArray(achievements)) {
      return res.status(400).json({ message: 'Achievements must be an array' });
    }

    portfolio.achievements = achievements;
    const updated = await db.updatePortfolio(portfolio);
    return res.status(200).json({ message: 'Achievements updated successfully', data: updated.achievements });
  } catch (err) {
    return res.status(500).json({ message: 'Error updating achievements', error: err.message });
  }
};
