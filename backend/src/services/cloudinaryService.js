const { Readable } = require('stream');
const cloudinary = require('../config/cloudinary');

/**
 * Upload an image buffer to Cloudinary
 * @param {Buffer} fileBuffer - The image file buffer from Multer
 * @param {String} folder - Cloudinary folder name (e.g. 'products')
 * @returns {Promise<{ url: String, public_id: String }>}
 */
const uploadToCloudinary = (fileBuffer, folder = 'products') => {
  return new Promise((resolve, reject) => {
    // If Cloudinary credentials are mock or missing during testing, return a mock payload
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME === 'mock_cloud' ||
      process.env.NODE_ENV === 'test'
    ) {
      const mockPublicId = `${folder}/mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      return resolve({
        url: `https://res.cloudinary.com/demo/image/upload/${mockPublicId}.jpg`,
        public_id: mockPublicId,
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    const readable = new Readable();
    readable._read = () => {};
    readable.push(fileBuffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

/**
 * Delete an image asset from Cloudinary
 * @param {String} publicId - Cloudinary asset public_id
 * @returns {Promise<Object>}
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME === 'mock_cloud' ||
    process.env.NODE_ENV === 'test'
  ) {
    return { result: 'ok' };
  }

  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Error deleting image ${publicId} from Cloudinary:`, error.message);
    return null;
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};
