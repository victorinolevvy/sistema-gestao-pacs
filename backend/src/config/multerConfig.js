const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Define the destination directory for uploads
const uploadDir = path.resolve(__dirname, '..', '..', 'uploads', 'comprovantes');

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage options
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files to the 'uploads/comprovantes' directory
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to avoid conflicts
    crypto.randomBytes(16, (err, hash) => {
      if (err) cb(err);

      const fileExtension = path.extname(file.originalname);
      const fileName = `${hash.toString('hex')}-${Date.now()}${fileExtension}`;
      cb(null, fileName);
    });
  },
});

// Configure file filter (optional: restrict file types)
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/pjpeg', // for older IE versions
    'image/png',
    'image/gif',
    'application/pdf',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Tipo de arquivo inválido. Apenas imagens (JPG, PNG, GIF) e PDF são permitidos.'), false); // Reject file
  }
};

// Configure limits (optional: restrict file size)
const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB limit
};

// Export the configured multer instance
module.exports = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits,
});
