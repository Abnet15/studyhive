const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Attempt to determine resource type based on mime type
    let resource_type = 'auto'; // 'image', 'video', 'raw'
    if (file.mimetype.includes('pdf') || file.mimetype.includes('document')) {
      resource_type = 'raw';
    } else if (file.mimetype.includes('image')) {
      resource_type = 'image';
    }

    return {
      folder: 'studyhive/materials',
      resource_type: resource_type,
      public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`
    };
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
