import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { createAgent, deleteAgent, getAgentActivity, getAgentById, getAgentList, getAgentsForExport, updateAgent } from '../services/agent.service';
import { successResponse } from '../utils/api-response';

export const createAgentController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agent = await createAgent(req.body, req.user!.userId);
    return res.status(201).json(successResponse(agent, 'Delivery agent created successfully'));
  } catch (error) {
    return next(error);
  }
};

export const getAgentActivityController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const activity = await getAgentActivity(id);
    return res.status(200).json(successResponse(activity));
  } catch (error) {
    return next(error);
  }
};

export const exportAgentsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agents = await getAgentsForExport(req.query as Record<string, any>);
    const escapeCsv = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const columns = ['Agent ID', 'Full Name', 'Phone Number', 'Email', 'Service Area', 'Status', 'Created At', 'Updated At'];
    const rows = agents.map((agent) => [
      agent.agentId,
      agent.fullName,
      agent.phoneNumber,
      agent.email,
      agent.serviceArea,
      agent.status,
      new Date(agent.createdAt).toISOString(),
      new Date(agent.updatedAt).toISOString(),
    ]);
    const csv = [columns, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="agents.csv"');
    return res.status(200).send(csv);
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
    const agent = await updateAgent(id, req.body, req.user!.userId);
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
    await deleteAgent(id, req.user!.userId);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
