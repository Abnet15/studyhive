const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Ensure local uploads directory exists
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

let storage;

// Use Cloudinary only if configured
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      // For study materials (documents, zips, PDFs, PPTs), we MUST use raw
      // to prevent Cloudinary from trying to transcode or manipulate the binary.
      const mt = file.mimetype.toLowerCase();
      let resourceType = 'raw';
      
      // Images can remain 'image' to allow Cloudinary optimizations
      if (mt.startsWith('image/')) {
        resourceType = 'image';
      }
      
      return {
        folder: 'studyhive/materials',
        resource_type: resourceType,
        public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`
      };
    },
  });
} else {
  // Fallback to local storage
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
}

const upload = multer({ storage: storage });

module.exports = upload;
