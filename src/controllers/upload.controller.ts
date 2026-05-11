import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { uploadToCloudinary } from '../utils/cloudinary';
import { AppError } from '../utils/AppError';

export const uploadImage = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('Please provide an image file', 400);
  }

  // Use the folder from query or default to 'misc'
  const folder = (req.query.folder as string) || 'misc';
  
  const result: any = await uploadToCloudinary(req.file, folder);

  res.status(200).json({
    status: 'success',
    data: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });
});
