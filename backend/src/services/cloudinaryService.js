const { Readable } = require('stream');
const cloudinary = require('../config/cloudinary');

const getCloudName = () =>
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUD_NAME ||
  process.env.cloud_name;

/**
 * Upload an image buffer to Cloudinary (with base64 fallback when credentials are not configured)
 * @param {Buffer} fileBuffer - The image file buffer from Multer
 * @param {String} folder - Cloudinary folder name (e.g. 'products')
 * @param {String} mimeType - File MIME type (e.g. 'image/png')
 * @returns {Promise<{ url: String, public_id: String }>}
 */
const uploadToCloudinary = (fileBuffer, folder = 'products', mimeType = 'image/jpeg') => {
  return new Promise((resolve, reject) => {
    const cloudName = getCloudName();

    // If Cloudinary credentials are mock or missing, create a base64 Data URI so the uploaded image displays perfectly
    if (
      !cloudName ||
      cloudName === 'mock_cloud' ||
      process.env.NODE_ENV === 'test'
    ) {
      const mockPublicId = `${folder}/asset_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const url = fileBuffer
        ? `data:${mimeType};base64,${fileBuffer.toString('base64')}`
        : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

      return resolve({
        url,
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
  const cloudName = getCloudName();
  if (
    !cloudName ||
    cloudName === 'mock_cloud' ||
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
