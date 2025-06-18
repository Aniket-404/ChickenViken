import { Cloudinary } from "@cloudinary/url-gen";
import generateSignature from '../utils/cloudinarySignature';

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Initialize Cloudinary instance
export const cld = new Cloudinary({
  cloud: {
    cloudName
  }
});

/**
 * Uploads an image to Cloudinary
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The URL of the uploaded image
 */
export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('cloud_name', cloudName);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
};

/**
 * Extracts the public ID from a Cloudinary URL
 * @param {string} url - The Cloudinary URL
 * @returns {string|null} - The public ID or null if not found
 */
export const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  try {
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/public_id.ext
    const matches = url.match(/\/v\d+\/(.+?)\./);
    return matches ? matches[1] : null;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

/**
 * Deletes an image from Cloudinary using the API
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<boolean>} - True if deletion was successful
 */
export const deleteImage = async (publicId) => {
  if (!publicId) return false;
  
  try {
    const timestamp = Math.round((new Date()).getTime() / 1000);
    const signature = await generateSignature(publicId, timestamp);
    
    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('signature', signature);
    formData.append('api_key', import.meta.env.VITE_CLOUDINARY_API_KEY);
    formData.append('timestamp', timestamp);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to delete image');
    }

    const data = await response.json();
    return data.result === 'ok';
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};
