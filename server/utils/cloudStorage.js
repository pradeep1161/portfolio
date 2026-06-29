const cloudinary = require('cloudinary').v2;
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Configure Cloudinary if keys exist
const hasCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('Cloudinary storage helper initialized.');
}

// Configure Firebase if keys exist
const hasFirebase = !!(
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_STORAGE_BUCKET
);

if (hasFirebase && !admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
    console.log('Firebase Storage helper initialized.');
  } catch (err) {
    console.error('Firebase Admin init error:', err.message);
  }
}

/**
 * Uploads a local file to cloud storage (Cloudinary or Firebase) if credentials exist.
 * Falls back to serving from local disk.
 * @param {string} localFilePath - Path to local file
 * @param {string} originalName - Original name of uploaded file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} The URL of the uploaded file
 */
const uploadToCloud = async (localFilePath, originalName, mimeType) => {
  const fileName = path.basename(localFilePath);
  
  // 1. Try Cloudinary
  if (hasCloudinary) {
    try {
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: 'portfolio',
        resource_type: 'auto',
        public_id: path.parse(originalName).name + '-' + Date.now()
      });
      // Delete temp file after upload
      fs.unlinkSync(localFilePath);
      return result.secure_url;
    } catch (err) {
      console.error('Cloudinary upload failed, checking Firebase fallback...', err);
    }
  }

  // 2. Try Firebase Storage
  if (hasFirebase) {
    try {
      const bucket = admin.storage().bucket();
      const destination = `portfolio/${Date.now()}-${originalName}`;
      
      await bucket.upload(localFilePath, {
        destination,
        public: true,
        metadata: {
          contentType: mimeType
        }
      });

      // Delete temp file after upload
      fs.unlinkSync(localFilePath);
      // Firebase public storage URL
      return `https://storage.googleapis.com/${bucket.name}/${destination}`;
    } catch (err) {
      console.error('Firebase upload failed, falling back to local file serving...', err);
    }
  }

  // 3. Fallback: Local static serving
  console.log(`Serving file locally: /uploads/${fileName}`);
  // We do NOT delete the file since it's being served locally
  return `/uploads/${fileName}`;
};

module.exports = {
  uploadToCloud,
  hasCloudinary,
  hasFirebase
};
