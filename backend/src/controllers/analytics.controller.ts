import { NextFunction, Request, Response } from 'express';
import { getAnalyticsOverview } from '../services/analytics.service';
import { successResponse } from '../utils/api-response';

export const getAnalyticsOverviewController = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAnalyticsOverview();
    return res.status(200).json(successResponse(result));
  } catch (error) {
    return next(error);
  }
};