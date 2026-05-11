import { v2 as cloudinary } from 'cloudinary';
import { AppError } from './AppError';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file: Express.Multer.File, folder: string) => {
  try {
    // Check if credentials exist
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary credentials missing');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `cvs-blogs/${folder}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(new AppError('Cloudinary upload failed', 500));
          resolve(result);
        }
      );

      uploadStream.end(file.buffer);
    });
  } catch (error) {
    throw new AppError('Image upload failed', 500);
  }
};

export default cloudinary;
