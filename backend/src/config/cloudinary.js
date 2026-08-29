const cloudinary = require('cloudinary').v2;

// Support both standard uppercase prefix and lowercase/short variable names
const cloudName =
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUD_NAME ||
  process.env.cloud_name;

const apiKey =
  process.env.CLOUDINARY_API_KEY ||
  process.env.API_KEY ||
  process.env.api_key;

const apiSecret =
  process.env.CLOUDINARY_API_SECRET ||
  process.env.API_SECRET ||
  process.env.api_secret;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

module.exports = cloudinary;
