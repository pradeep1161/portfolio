require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models/db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded Files Statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register API Routes
app.use('/api', apiRoutes);

// Static serving for Production (React build folder)
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// Fallback all other GET requests to React App (SPA Router support)
app.get('*', (req, res) => {
  const indexPath = path.join(clientBuildPath, 'index.html');
  // Check if frontend build exists, if so serve it, otherwise send API status check
  const fs = require('fs');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).json({ 
      status: "Running", 
      message: "Express server running. React frontend has not been compiled yet (run 'npm run build' inside client folder to serve it statically here)." 
    });
  }
});

// Connect to Database and start Server
const startServer = async () => {
  try {
    await db.connect();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Open API at: http://localhost:${PORT}/api/portfolio`);
    });
  } catch (err) {
    console.error('Server startup failed:', err.message);
    process.exit(1);
  }
};

startServer();
