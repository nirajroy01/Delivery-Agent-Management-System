import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { createAgent, deleteAgent, getAgentById, getAgentList, updateAgent } from '../services/agent.service';
import { successResponse } from '../utils/api-response';

export const createAgentController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agent = await createAgent(req.body);
    return res.status(201).json(successResponse(agent, 'Delivery agent created successfully'));
  } catch (error) {
    return next(error);
  }
};

export const getAgentsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAgentList(req.query as Record<string, any>);
    return res.status(200).json(successResponse(result));
  } catch (error) {
    return next(error);
  }
};

export const getAgentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const agent = await getAgentById(id);
    return res.status(200).json(successResponse(agent));
  } catch (error) {
    return next(error);
  }
};

export const updateAgentController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const agent = await updateAgent(id, req.body);
    return res.status(200).json(successResponse(agent, 'Delivery agent updated successfully'));
  } catch (error) {
    return next(error);
  }
};

export const deleteAgentController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await deleteAgent(id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
