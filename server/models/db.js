const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Paths for JSON fallback DB
const DATA_DIR = path.join(__dirname, '../data');
const FILE_PATHS = {
  admin: path.join(DATA_DIR, 'admin.json'),
  portfolio: path.join(DATA_DIR, 'portfolio.json'),
  messages: path.join(DATA_DIR, 'messages.json'),
  analytics: path.join(DATA_DIR, 'analytics.json'),
  blogs: path.join(DATA_DIR, 'blogs.json')
};

let useMongoDB = false;

// --- INITIAL SEED DATA ---
const initialPortfolio = {
  profile: {
    name: "Pradeep Tallapally",
    title: "AI & Machine Learning Engineer",
    subtitle: "Building AI solutions for Healthcare and Real-world Problems.",
    avatar: "", // empty initially, will upload
    resumeUrl: "",
    bio: "Aspiring AI & ML Engineer passionate about Machine Learning, Deep Learning, Computer Vision, and Full Stack Development. Interested in building practical AI systems that solve real-world problems, particularly in healthcare and data-driven applications.",
    email: "pradeeptallapally116@gmail.com",
    phone: "+91 9876543210",
    location: "Hyderabad, India",
    seekingInternship: true,
    socials: {
      github: "https://github.com/pradeep1161",
      linkedin: "https://linkedin.com/in/pradeep-tallapally",
      leetcode: "",
      codechef: "",
      codeforces: "",
      hackerrank: "",
      smartinterviews: ""
    }
  },
  education: [
    {
      id: "edu-1",
      degree: "B.Tech in Artificial Intelligence & Machine Learning",
      school: "CMR Technical Campus",
      duration: "2022 - 2026",
      grade: "CGPA: 7.74"
    }
  ],
  skills: [
    { id: "sk-1", name: "Python", category: "Programming", level: 90 },
    { id: "sk-2", name: "C", category: "Programming", level: 80 },
    { id: "sk-3", name: "C++", category: "Programming", level: 85 },
    { id: "sk-4", name: "HTML/CSS", category: "Web", level: 85 },
    { id: "sk-5", name: "JavaScript", category: "Web", level: 80 },
    { id: "sk-6", name: "MySQL", category: "Database", level: 75 },
    { id: "sk-7", name: "TensorFlow", category: "Machine Learning", level: 85 },
    { id: "sk-8", name: "Scikit-learn", category: "Machine Learning", level: 85 },
    { id: "sk-9", name: "CNN", category: "Machine Learning", level: 80 },
    { id: "sk-10", name: "EfficientNet", category: "Machine Learning", level: 85 },
    { id: "sk-11", name: "Grad-CAM", category: "Machine Learning", level: 80 },
    { id: "sk-12", name: "DSA", category: "CS Fundamentals", level: 80 },
    { id: "sk-13", name: "OOP", category: "CS Fundamentals", level: 85 },
    { id: "sk-14", name: "DBMS", category: "CS Fundamentals", level: 75 },
    { id: "sk-15", name: "OS", category: "CS Fundamentals", level: 75 },
    { id: "sk-16", name: "CN", category: "CS Fundamentals", level: 70 },
    { id: "sk-17", name: "VS Code", category: "Tools", level: 90 },
    { id: "sk-18", name: "Git & GitHub", category: "Tools", level: 85 },
    { id: "sk-19", name: "Google Colab", category: "Tools", level: 90 },
    { id: "sk-20", name: "Jupyter Notebook", category: "Tools", level: 90 }
  ],
  experience: [
    {
      id: "exp-1",
      company: "Seeking Opportunities",
      role: "AI/ML Internship",
      duration: "Present",
      description: "Actively looking for AI/ML and Data Science internship opportunities to apply my skills in deep learning, computer vision, and machine learning to industry challenges."
    }
  ],
  projects: [
    {
      id: "proj-1",
      title: "AI-Driven System for Early Diagnosis and Prevention of Diabetic Eye Diseases",
      description: "An advanced Deep Learning medical solution designed to detect and grade diabetic retinopathy using retinal fundus images and optical coherence tomography (OCT) scans.",
      category: "AI & Deep Learning",
      github: "https://github.com/pradeep1161/AI-driven-system-for-early-diagnosis-and-prevention-of-diabetic-eye-diseases",
      demo: "",
      features: [
        "Deep Learning classification powered by EfficientNetV2-S",
        "Dual analysis of Fundus photographs and OCT scans",
        "Grad-CAM explainability for medical validation and visualization of pathology regions",
        "Gemini AI integration for automated medical report summary and recommendations"
      ],
      tech: ["Python", "TensorFlow", "EfficientNetV2", "Grad-CAM", "Gemini AI", "React", "Flask"],
      image: "", // Uploadable
      screenshots: []
    },
    {
      id: "proj-2",
      title: "Predictive Analysis of Big-Mart Sales",
      description: "A machine learning product that forecasts product sales across multiple stores to optimize stock and inventory replenishment operations.",
      category: "Machine Learning",
      github: "",
      demo: "",
      features: [
        "Data cleaning and exploratory analysis of sales variables",
        "Regression models: Linear Regression, Ridge, and Lasso Regression",
        "Evaluation using mean absolute error (MAE) and root mean squared error (RMSE)"
      ],
      tech: ["Python", "Scikit-Learn", "Pandas", "Matplotlib", "Seaborn"],
      image: "",
      screenshots: []
    }
  ],
  certifications: [
    { id: "cert-1", title: "IBM SkillsBuild AI Fundamentals", issuer: "IBM", date: "2024", url: "" },
    { id: "cert-2", title: "Smart Interviews", issuer: "Smart Interviews", date: "2024", url: "" },
    { id: "cert-3", title: "AI Foundation and Advanced", issuer: "NASSCOM / Industry partners", date: "2024", url: "" }
  ],
  achievements: [
    { id: "ach-1", title: "Smart Interviews", detail: "Global Rank 7912" },
    { id: "ach-2", title: "CodeChef", detail: "Global Rank 1332" }
  ]
};

const initialAnalytics = {
  totalViews: 0,
  projectViews: {},
  countryViews: {},
  dailyViews: []
};

// --- HELPER FUNCTIONS FOR FILE DATABASE ---
const readJsonFile = (filePath, fallback = {}) => {
  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
};

const writeJsonFile = (filePath, data) => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing to ${filePath}:`, err);
  }
};

// --- MONGOOSE MONGO SCHEMAS ---
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const portfolioSchema = new mongoose.Schema({
  profile: mongoose.Schema.Types.Mixed,
  education: Array,
  skills: Array,
  experience: Array,
  projects: Array,
  certifications: Array,
  achievements: Array
});

const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
  subject: String,
  message: String,
  date: { type: Date, default: Date.now }
});

const analyticsSchema = new mongoose.Schema({
  totalViews: { type: Number, default: 0 },
  projectViews: { type: Map, of: Number, default: {} },
  countryViews: { type: Map, of: Number, default: {} },
  dailyViews: Array
});

const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: String,
  tags: [String],
  date: { type: Date, default: Date.now }
});

let UserModel, PortfolioModel, MessageModel, AnalyticsModel, BlogModel;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (uri) {
    try {
      await mongoose.connect(uri);
      console.log('Successfully connected to MongoDB.');
      useMongoDB = true;
      
      // Init models
      UserModel = mongoose.model('User', userSchema);
      PortfolioModel = mongoose.model('Portfolio', portfolioSchema);
      MessageModel = mongoose.model('Message', messageSchema);
      AnalyticsModel = mongoose.model('Analytics', analyticsSchema);
      BlogModel = mongoose.model('Blog', blogSchema);

      // Seed if empty
      const userCount = await UserModel.countDocuments();
      if (userCount === 0) {
        const hashedPassword = await bcrypt.hash("Pradeep@116", 10);
        await UserModel.create({ username: "pradeep_116", password: hashedPassword });
        console.log('Seeded MongoDB Admin account.');
      }
      
      const portCount = await PortfolioModel.countDocuments();
      if (portCount === 0) {
        await PortfolioModel.create(initialPortfolio);
        console.log('Seeded MongoDB Portfolio.');
      }

      const analyticsCount = await AnalyticsModel.countDocuments();
      if (analyticsCount === 0) {
        await AnalyticsModel.create(initialAnalytics);
      }
      
    } catch (err) {
      console.warn('MongoDB connection failed. Falling back to local JSON files.', err.message);
      setupLocalDB();
    }
  } else {
    console.log('No MONGODB_URI found. Using local JSON database fallback.');
    setupLocalDB();
  }
};

const setupLocalDB = () => {
  useMongoDB = false;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Seed Admin
  if (!fs.existsSync(FILE_PATHS.admin)) {
    const hashedPassword = bcrypt.hashSync("Pradeep@116", 10);
    writeJsonFile(FILE_PATHS.admin, { username: "pradeep_116", password: hashedPassword });
    console.log('Seeded JSON Admin account.');
  }

  // Seed Portfolio
  if (!fs.existsSync(FILE_PATHS.portfolio)) {
    writeJsonFile(FILE_PATHS.portfolio, initialPortfolio);
    console.log('Seeded JSON Portfolio.');
  }

  // Seed Analytics
  if (!fs.existsSync(FILE_PATHS.analytics)) {
    writeJsonFile(FILE_PATHS.analytics, initialAnalytics);
  }

  // Seed empty files
  if (!fs.existsSync(FILE_PATHS.messages)) {
    writeJsonFile(FILE_PATHS.messages, []);
  }
  if (!fs.existsSync(FILE_PATHS.blogs)) {
    writeJsonFile(FILE_PATHS.blogs, []);
  }
};

// --- DATA ACCESS API WRAPPERS ---

const db = {
  connect: connectDB,
  
  // User operations
  getAdmin: async (username) => {
    if (useMongoDB) {
      return await UserModel.findOne({ username });
    } else {
      const admin = readJsonFile(FILE_PATHS.admin);
      return admin.username === username ? admin : null;
    }
  },

  updateAdminPassword: async (username, newPasswordHash) => {
    if (useMongoDB) {
      await UserModel.updateOne({ username }, { password: newPasswordHash });
    } else {
      const admin = readJsonFile(FILE_PATHS.admin);
      if (admin.username === username) {
        admin.password = newPasswordHash;
        writeJsonFile(FILE_PATHS.admin, admin);
      }
    }
  },

  // Portfolio CRUD operations
  getPortfolio: async () => {
    if (useMongoDB) {
      const doc = await PortfolioModel.findOne();
      return doc || initialPortfolio;
    } else {
      return readJsonFile(FILE_PATHS.portfolio, initialPortfolio);
    }
  },

  updatePortfolio: async (data) => {
    if (useMongoDB) {
      // Find the first or create
      const doc = await PortfolioModel.findOne();
      if (doc) {
        Object.assign(doc, data);
        doc.markModified('profile');
        doc.markModified('education');
        doc.markModified('skills');
        doc.markModified('experience');
        doc.markModified('projects');
        doc.markModified('certifications');
        doc.markModified('achievements');
        await doc.save();
      } else {
        await PortfolioModel.create(data);
      }
      return data;
    } else {
      writeJsonFile(FILE_PATHS.portfolio, data);
      return data;
    }
  },

  // Messages operations
  getMessages: async () => {
    if (useMongoDB) {
      return await MessageModel.find().sort({ date: -1 });
    } else {
      return readJsonFile(FILE_PATHS.messages, []);
    }
  },

  addMessage: async (msgData) => {
    const newMessage = {
      id: useMongoDB ? undefined : 'msg-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      name: msgData.name,
      email: msgData.email,
      subject: msgData.subject,
      message: msgData.message,
      date: new Date()
    };

    if (useMongoDB) {
      const doc = await MessageModel.create(newMessage);
      return doc;
    } else {
      const messages = readJsonFile(FILE_PATHS.messages, []);
      messages.unshift(newMessage);
      writeJsonFile(FILE_PATHS.messages, messages);
      return newMessage;
    }
  },

  deleteMessage: async (id) => {
    if (useMongoDB) {
      await MessageModel.findByIdAndDelete(id);
    } else {
      let messages = readJsonFile(FILE_PATHS.messages, []);
      messages = messages.filter(m => m.id !== id);
      writeJsonFile(FILE_PATHS.messages, messages);
    }
  },

  // Analytics Operations
  getAnalytics: async () => {
    if (useMongoDB) {
      const doc = await AnalyticsModel.findOne();
      return doc || initialAnalytics;
    } else {
      return readJsonFile(FILE_PATHS.analytics, initialAnalytics);
    }
  },

  updateAnalytics: async (data) => {
    if (useMongoDB) {
      const doc = await AnalyticsModel.findOne();
      if (doc) {
        Object.assign(doc, data);
        await doc.save();
      } else {
        await AnalyticsModel.create(data);
      }
    } else {
      writeJsonFile(FILE_PATHS.analytics, data);
    }
  },

  // Blogs Operations
  getBlogs: async () => {
    if (useMongoDB) {
      return await BlogModel.find().sort({ date: -1 });
    } else {
      return readJsonFile(FILE_PATHS.blogs, []);
    }
  },

  addBlog: async (blogData) => {
    const newBlog = {
      id: useMongoDB ? undefined : 'blog-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      title: blogData.title,
      content: blogData.content,
      category: blogData.category,
      tags: blogData.tags || [],
      date: new Date()
    };

    if (useMongoDB) {
      return await BlogModel.create(newBlog);
    } else {
      const blogs = readJsonFile(FILE_PATHS.blogs, []);
      blogs.unshift(newBlog);
      writeJsonFile(FILE_PATHS.blogs, blogs);
      return newBlog;
    }
  },

  updateBlog: async (id, blogData) => {
    if (useMongoDB) {
      return await BlogModel.findByIdAndUpdate(id, blogData, { new: true });
    } else {
      const blogs = readJsonFile(FILE_PATHS.blogs, []);
      const index = blogs.findIndex(b => b.id === id);
      if (index !== -1) {
        blogs[index] = { ...blogs[index], ...blogData };
        writeJsonFile(FILE_PATHS.blogs, blogs);
        return blogs[index];
      }
      return null;
    }
  },

  deleteBlog: async (id) => {
    if (useMongoDB) {
      await BlogModel.findByIdAndDelete(id);
    } else {
      let blogs = readJsonFile(FILE_PATHS.blogs, []);
      blogs = blogs.filter(b => b.id !== id);
      writeJsonFile(FILE_PATHS.blogs, blogs);
    }
  }
};

module.exports = db;
