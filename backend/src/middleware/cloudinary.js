const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const sharp = require('sharp');
const { EventEmitter } = require('events');
const config = require('../config')[process.env.NODE_ENV || 'development'];

// Configure Cloudinary
if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true
  });
  console.log('✅ Cloudinary configured successfully');
} else {
  console.warn('⚠️ Cloudinary not configured, falling back to local storage');
}

// Upload progress tracker
const uploadProgress = new EventEmitter();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit (Cloudinary supports larger files)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = {
      // Images
      'image/jpeg': 'image',
      'image/jpg': 'image',
      'image/png': 'image',
      'image/webp': 'image',
      'image/gif': 'image',
      'image/svg+xml': 'image',
      // Videos
      'video/mp4': 'video',
      'video/quicktime': 'video',
      'video/avi': 'video',
      'video/mov': 'video',
      'video/wmv': 'video',
      'video/webm': 'video',
      // Documents
      'application/pdf': 'document',
      'application/msword': 'document',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
      'application/vnd.ms-excel': 'document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'document',
      'application/vnd.ms-powerpoint': 'document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'document',
      'text/plain': 'document',
      'text/csv': 'document',
      // Audio
      'audio/mpeg': 'audio',
      'audio/wav': 'audio',
      'audio/mp3': 'audio',
      'audio/ogg': 'audio'
    };

    if (allowedTypes[file.mimetype]) {
      file.mediaType = allowedTypes[file.mimetype];
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Supported types: ${Object.keys(allowedTypes).join(', ')}`));
    }
  },
});

// Check if Cloudinary is available
const isCloudinaryAvailable = () => {
  return !!(config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret);
};

// Upload to Cloudinary with retry logic
const uploadToCloudinary = async (buffer, options = {}, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            ...options,
            resource_type: 'auto',
            quality: 'auto:best',
            fetch_format: 'auto'
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        stream.end(buffer);
      });
    } catch (error) {
      console.error(`Cloudinary upload attempt ${attempt} failed:`, error);
      if (attempt === retries) {
        throw error;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

// Process image with Sharp before uploading
const processImageBuffer = async (buffer, options = {}) => {
  try {
    let sharpInstance = sharp(buffer);
    
    // Auto-orient based on EXIF data
    sharpInstance = sharpInstance.rotate();
    
    // Apply transformations based on options
    if (options.resize) {
      const { width, height, fit = 'cover' } = options.resize;
      sharpInstance = sharpInstance.resize(width, height, {
        fit,
        position: 'center',
        withoutEnlargement: true
      });
    }
    
    // Optimize for web
    if (options.optimize !== false) {
      sharpInstance = sharpInstance.jpeg({ quality: 85, progressive: true });
    }
    
    return await sharpInstance.toBuffer();
  } catch (error) {
    console.error('Image processing error:', error);
    // Return original buffer if processing fails
    return buffer;
  }
};

// Enhanced avatar upload and processing
const avatarUpload = upload.single('avatar');

const processAvatar = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const userId = req.user.id;
    const timestamp = Date.now();
    
    if (isCloudinaryAvailable()) {
      // Process image for avatar
      const processedBuffer = await processImageBuffer(req.file.buffer, {
        resize: { width: 400, height: 400, fit: 'cover' },
        optimize: true
      });
      
      // Upload to Cloudinary
      const result = await uploadToCloudinary(processedBuffer, {
        folder: 'avatars',
        public_id: `avatar_${userId}_${timestamp}`,
        transformation: [
          { width: 400, height: 400, crop: 'fill' },
          { quality: 'auto:best' },
          { fetch_format: 'auto' }
        ],
        overwrite: true
      });
      
      req.processedAvatar = {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      };
    } else {
      // Fallback to local processing
      const localUpload = require('./upload');
      await localUpload.processAvatar(req, res, () => {});
    }
    
    next();
  } catch (error) {
    console.error('Avatar processing error:', error);
    next(error);
  }
};

// Enhanced media upload for posts
const mediaUpload = upload.array('media', 10);

const processMedia = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    const userId = req.user.id;
    const timestamp = Date.now();
    
    if (isCloudinaryAvailable()) {
      const processedFiles = await Promise.all(
        req.files.map(async (file, index) => {
          const publicId = `post_${userId}_${timestamp}_${index}`;
          
          try {
            let processedBuffer = file.buffer;
            let uploadOptions = {
              folder: 'posts',
              public_id: publicId
            };
            
            // Handle different media types
            switch (file.mediaType) {
              case 'image':
                processedBuffer = await processImageBuffer(file.buffer, {
                  resize: { width: 1200, height: 1200, fit: 'inside' },
                  optimize: true
                });
                uploadOptions.transformation = [
                  { quality: 'auto:best' },
                  { fetch_format: 'auto' }
                ];
                break;
                
              case 'video':
                uploadOptions.resource_type = 'video';
                uploadOptions.transformation = [
                  { quality: 'auto:best' },
                  { fetch_format: 'auto' }
                ];
                break;
                
              case 'document':
              case 'audio':
                uploadOptions.resource_type = 'raw';
                break;
            }
            
            const result = await uploadToCloudinary(processedBuffer, uploadOptions);
            
            return {
              url: result.secure_url,
              publicId: result.public_id,
              type: file.mediaType,
              originalName: file.originalname,
              mimeType: file.mimetype,
              size: result.bytes,
              width: result.width,
              height: result.height,
              format: result.format
            };
          } catch (error) {
            console.error(`Error processing file ${file.originalname}:`, error);
            throw error;
          }
        })
      );
      
      req.processedMedia = processedFiles;
    } else {
      // Fallback to local processing
      const localUpload = require('./upload');
      await localUpload.processMedia(req, res, () => {});
    }
    
    next();
  } catch (error) {
    console.error('Media processing error:', error);
    next(error);
  }
};

// Enhanced chat media upload
const chatMediaUpload = upload.single('chatMedia');

const processChatMedia = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const userId = req.user.id;
    const timestamp = Date.now();
    const uploadId = `${userId}_${timestamp}`;
    
    // Emit progress start
    uploadProgress.emit('progress', {
      uploadId,
      progress: 0,
      status: 'starting'
    });
    
    if (isCloudinaryAvailable()) {
      let processedBuffer = req.file.buffer;
      let uploadOptions = {
        folder: 'chat',
        public_id: `chat_${uploadId}`
      };
      
      // Handle different media types
      switch (req.file.mediaType) {
        case 'image':
          processedBuffer = await processImageBuffer(req.file.buffer, {
            resize: { width: 800, height: 800, fit: 'inside' },
            optimize: true
          });
          uploadOptions.transformation = [
            { quality: 'auto:best' },
            { fetch_format: 'auto' }
          ];
          break;
          
        case 'video':
          uploadOptions.resource_type = 'video';
          uploadOptions.transformation = [
            { quality: 'auto:best' },
            { fetch_format: 'auto' }
          ];
          break;
          
        case 'document':
        case 'audio':
          uploadOptions.resource_type = 'raw';
          break;
      }
      
      // Emit progress update
      uploadProgress.emit('progress', {
        uploadId,
        progress: 50,
        status: 'uploading'
      });
      
      const result = await uploadToCloudinary(processedBuffer, uploadOptions);
      
      req.processedChatMedia = {
        url: result.secure_url,
        publicId: result.public_id,
        type: req.file.mediaType,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: result.bytes,
        width: result.width,
        height: result.height,
        format: result.format,
        uploadId
      };
      
      // Emit progress complete
      uploadProgress.emit('progress', {
        uploadId,
        progress: 100,
        status: 'completed'
      });
    } else {
      // Fallback to local processing
      const localUpload = require('./upload');
      await localUpload.processChatMedia(req, res, () => {});
    }
    
    next();
  } catch (error) {
    console.error('Chat media processing error:', error);
    
    // Emit progress error
    const uploadId = `${req.user.id}_${Date.now()}`;
    uploadProgress.emit('progress', {
      uploadId,
      progress: 0,
      status: 'error',
      error: error.message
    });
    
    next(error);
  }
};

// Delete media from Cloudinary
const deleteMedia = async (publicId, resourceType = 'image') => {
  if (!isCloudinaryAvailable()) {
    console.warn('Cloudinary not available for media deletion');
    return false;
  }
  
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting media from Cloudinary:', error);
    return false;
  }
};

// Get media transformation URL
const getTransformedUrl = (publicId, transformations = []) => {
  if (!isCloudinaryAvailable()) {
    return null;
  }
  
  return cloudinary.url(publicId, {
    transformation: transformations,
    secure: true
  });
};

// Utility function to extract public ID from Cloudinary URL
const extractPublicId = (cloudinaryUrl) => {
  if (!cloudinaryUrl || !cloudinaryUrl.includes('cloudinary.com')) {
    return null;
  }
  
  try {
    const parts = cloudinaryUrl.split('/');
    const uploadIndex = parts.findIndex(part => part === 'upload');
    if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
      const pathWithExtension = parts.slice(uploadIndex + 2).join('/');
      // Remove file extension
      return pathWithExtension.replace(/\.[^/.]+$/, '');
    }
  } catch (error) {
    console.error('Error extracting public ID:', error);
  }
  
  return null;
};

module.exports = {
  avatarUpload,
  processAvatar,
  mediaUpload,
  processMedia,
  chatMediaUpload,
  processChatMedia,
  uploadProgress,
  deleteMedia,
  getTransformedUrl,
  extractPublicId,
  isCloudinaryAvailable,
  cloudinary
}; 