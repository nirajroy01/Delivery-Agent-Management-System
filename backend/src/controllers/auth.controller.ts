import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { getCurrentUser, loginUser, registerUser } from '../services/auth.service';
import { successResponse } from '../utils/api-response';

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await registerUser(req.body);
    return res.status(201).json(successResponse(user, 'User registered successfully'));
  } catch (error) {
    return next(error);
  }
};

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await loginUser(req.body);
    return res.status(200).json(successResponse(result));
  } catch (error) {
    return next(error);
  }
};

export const meController = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await getCurrentUser(req.user!.userId);
    return res.status(200).json(successResponse(user));
  } catch (error) {
    return next(error);
  }
};
