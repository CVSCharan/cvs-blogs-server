import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as adminService from '../services/admin.service';

export const getStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await adminService.getSystemStats();
  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});
