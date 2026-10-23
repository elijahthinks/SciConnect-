const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const { EventEmitter } = require('events');

// Upload progress tracker
const uploadProgress = new EventEmitter();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = {
      'image/jpeg': 'image',
      'image/png': 'image',
      'image/webp': 'image',
      'image/gif': 'image',
      'video/mp4': 'video',
      'video/quicktime': 'video',
      'application/pdf': 'document',
      'application/msword': 'document',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document'
    };

    if (allowedTypes[file.mimetype]) {
      file.mediaType = allowedTypes[file.mimetype];
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images (JPEG, PNG, WebP, GIF), videos (MP4, MOV), and documents (PDF, DOC, DOCX) are allowed.'));
    }
  },
});

// Ensure upload directories exist
const uploadDirs = {
  avatar: path.join(__dirname, '../uploads/avatars'),
  image: path.join(__dirname, '../uploads/images'),
  video: path.join(__dirname, '../uploads/videos'),
  document: path.join(__dirname, '../uploads/documents'),
  chat: path.join(__dirname, '../uploads/chat')
};

const ensureUploadDirs = async () => {
  await Promise.all(
    Object.values(uploadDirs).map(dir => 
      fs.mkdir(dir, { recursive: true })
    )
  );
};

// Generate unique filename
const generateFilename = (originalname) => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalname);
  return `${timestamp}_${random}${ext}`;
};

// Process and save image
const processImage = async (buffer, filename, size = null, progressCallback = null) => {
  await ensureUploadDirs();
  
  let processedImage = sharp(buffer);
  
  if (size) {
    processedImage = processedImage.resize(size, size, {
      fit: 'cover',
      position: 'center'
    });
  } else {
    processedImage = processedImage.resize(1200, null, {
      fit: 'inside',
      withoutEnlargement: true
    });
  }

  if (progressCallback) {
    processedImage.on('progress', (progress) => {
      progressCallback(progress.percent);
    });
  }
  
  const processedImageBuffer = await processedImage
    .webp({ quality: 80 })
    .toBuffer();

  const outputPath = path.join(uploadDirs.image, `${filename}.webp`);
  await fs.writeFile(outputPath, processedImageBuffer);
  
  return `uploads/images/${filename}.webp`;
};

// Save video or document
const saveFile = async (buffer, filename, type, progressCallback = null) => {
  await ensureUploadDirs();
  
  const outputPath = path.join(uploadDirs[type], filename);
  
  if (progressCallback) {
    const totalSize = buffer.length;
    const chunkSize = 64 * 1024; // 64KB chunks
    const totalChunks = Math.ceil(totalSize / chunkSize);
    let processedChunks = 0;

    for (let i = 0; i < totalSize; i += chunkSize) {
      const chunk = buffer.slice(i, i + chunkSize);
      await fs.appendFile(outputPath, chunk);
      processedChunks++;
      progressCallback((processedChunks / totalChunks) * 100);
    }
  } else {
    await fs.writeFile(outputPath, buffer);
  }
  
  return `uploads/${type}s/${filename}`;
};

// Middleware for avatar upload
const avatarUpload = upload.single('avatar');

// Handle avatar processing
const processAvatar = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const filename = `avatar_${req.user.id}_${Date.now()}`;
    const avatarPath = await processImage(req.file.buffer, filename, 200);
    req.processedAvatar = avatarPath;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware for post media upload
const mediaUpload = upload.array('media', 10); // Max 10 files

// Handle post media processing
const processMedia = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    const processedFiles = await Promise.all(
      req.files.map(async file => {
        const filename = generateFilename(file.originalname);
        let filePath;

        switch (file.mediaType) {
          case 'image':
            filePath = await processImage(file.buffer, filename);
            break;
          case 'video':
          case 'document':
            filePath = await saveFile(file.buffer, filename, file.mediaType);
            break;
        }

        return {
          url: filePath,
          type: file.mediaType
        };
      })
    );

    req.processedMedia = processedFiles;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware for chat media upload
const chatMediaUpload = upload.single('chatMedia');

// Handle chat media processing
const processChatMedia = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const filename = generateFilename(req.file.originalname);
    const uploadId = `${req.user.id}_${Date.now()}`;
    let filePath;

    const progressHandler = (progress) => {
      uploadProgress.emit('progress', {
        uploadId,
        progress: Math.round(progress)
      });
    };

    switch (req.file.mediaType) {
      case 'image':
        filePath = await processImage(req.file.buffer, filename, null, progressHandler);
        break;
      case 'video':
      case 'document':
        filePath = await saveFile(req.file.buffer, filename, req.file.mediaType, progressHandler);
        break;
    }

    req.processedChatMedia = {
      url: filePath,
      type: req.file.mediaType,
      uploadId
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  avatarUpload,
  processAvatar,
  mediaUpload,
  processMedia,
  chatMediaUpload,
  processChatMedia,
  uploadProgress
}; 