import { Agent } from '../models/agent.model';
import { AgentActivity, AgentActivityAction } from '../models/agent-activity.model';
import { CreateAgentInput, UpdateAgentInput } from '../types/agent.types';
import { generateAgentId } from '../utils/agent-id';
import * as cacheService from './cache.service';

const serializeAgent = (agent: any) => ({
  id: agent._id.toString(),
  agentId: agent.agentId,
  fullName: agent.fullName,
  phoneNumber: agent.phoneNumber,
  email: agent.email,
  serviceArea: agent.serviceArea,
  status: agent.status,
  createdAt: agent.createdAt,
  updatedAt: agent.updatedAt,
});

const buildAgentFilter = (query: Record<string, any>) => {
  const filter: any = {};
  if (query.status) filter.status = query.status;
  if (query.serviceArea) {
    const serviceAreas = Array.isArray(query.serviceArea) ? query.serviceArea : [query.serviceArea];
    filter.serviceArea = { $in: serviceAreas.map((area: string) => new RegExp(area, 'i')) };
  }
  if (query.search) {
    filter.$or = [
      { fullName: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
      { agentId: { $regex: query.search, $options: 'i' } },
      { serviceArea: { $regex: query.search, $options: 'i' } },
    ];
  }
  return filter;
};

const recordActivity = async (
  agentId: string,
  performedBy: string,
  action: AgentActivityAction,
  description: string,
  previousValue?: string,
  newValue?: string,
) => {
  await AgentActivity.create({ agentId, performedBy, action, description, previousValue, newValue });
};

const notFoundError = () => {
  const error: any = new Error('Delivery agent not found');
  error.statusCode = 404;
  return error;
};

export const createAgent = async (data: CreateAgentInput, performedBy: string) => {
  const email = data.email.toLowerCase();
  const existing = await Agent.findOne({ email });
  if (existing) {
    const error: any = new Error('Agent email already exists');
    error.statusCode = 409;
    throw error;
  }

  const agentId = await generateAgentId();
  const created = await Agent.create({
    ...data,
    email,
    agentId,
  });

  await cacheService.invalidateAgentListCaches();
  await recordActivity(created._id.toString(), performedBy, 'AGENT_CREATED', 'Agent created');

  return serializeAgent(created.toObject ? created.toObject() : created);
};

export const getAgentList = async (query: Record<string, any>) => {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  const filter = buildAgentFilter(query);

  const cacheKey = { page, limit, status: query.status, serviceArea: query.serviceArea, search: query.search };
  const cached = await cacheService.getCachedAgentList(cacheKey);
  if (cached) {
    return cached;
  }

  const skip = (page - 1) * limit;
  const [agents, total] = await Promise.all([
    Agent.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Agent.countDocuments(filter),
  ]);

  const result = {
    agents: agents.map((agent) => serializeAgent(agent)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };

  await cacheService.setCachedAgentList(cacheKey, result);
  return result;
};

export const getAgentsForExport = async (query: Record<string, any>) => {
  const agents = await Agent.find(buildAgentFilter(query)).sort({ createdAt: -1 }).lean();
  return agents.map((agent) => serializeAgent(agent));
};

export const getAgentById = async (id: string) => {
  const cached = await cacheService.getCachedAgent(id);
  if (cached) {
    return cached;
  }

  const agent = await Agent.findById(id).lean();
  if (!agent) {
    throw notFoundError();
  }

  const serialized = serializeAgent(agent);
  await cacheService.setCachedAgent(id, serialized);
  return serialized;
};

export const updateAgent = async (id: string, data: UpdateAgentInput, performedBy: string) => {
  const agent = await Agent.findById(id);
  if (!agent) {
    throw notFoundError();
  }

  if (data.email && data.email.toLowerCase() !== agent.email) {
    const existing = await Agent.findOne({ email: data.email.toLowerCase() });
    if (existing && existing._id.toString() !== id) {
      const error: any = new Error('Agent email already exists');
      error.statusCode = 409;
      throw error;
    }
  }

  const previousStatus = agent.status;
  const previousServiceArea = agent.serviceArea;
  const changedProfileFields = (['fullName', 'phoneNumber', 'email'] as const).filter(
    (field) => data[field] !== undefined && data[field] !== agent[field],
  );
  const statusChanged = data.status !== undefined && data.status !== previousStatus;
  const serviceAreaChanged = data.serviceArea !== undefined && data.serviceArea !== previousServiceArea;

  Object.assign(agent, data);
  if (data.email) agent.email = data.email.toLowerCase();
  await agent.save({ validateBeforeSave: true });

  await cacheService.invalidateAgentCache(id);
  await cacheService.invalidateAgentListCaches();

  if (statusChanged) {
    await recordActivity(id, performedBy, 'STATUS_CHANGED', 'Status changed', previousStatus, agent.status);
  }
  if (serviceAreaChanged) {
    await recordActivity(id, performedBy, 'SERVICE_AREA_CHANGED', 'Service area changed', previousServiceArea, agent.serviceArea);
  }
  if (changedProfileFields.length) {
    const labels: Record<(typeof changedProfileFields)[number], string> = {
      fullName: 'Full name',
      phoneNumber: 'Phone number',
      email: 'Email',
    };
    await recordActivity(
      id,
      performedBy,
      'PROFILE_UPDATED',
      `Profile updated: ${changedProfileFields.map((field) => labels[field]).join(', ')}`,
    );
  }

  return serializeAgent(agent.toObject ? agent.toObject() : agent);
};

export const deleteAgent = async (id: string, performedBy: string) => {
  const agent = await Agent.findByIdAndDelete(id);
  if (!agent) {
    throw notFoundError();
  }

  await cacheService.invalidateAgentCache(id);
  await cacheService.invalidateAgentListCaches();
  await recordActivity(id, performedBy, 'AGENT_DELETED', 'Agent deleted');
  return null;
};

export const getAgentActivity = async (id: string) => {
  if (!(await Agent.exists({ _id: id }))) throw notFoundError();

  const activity = await AgentActivity.find({ agentId: id }).sort({ createdAt: -1, _id: -1 }).lean();
  return activity.map((entry) => ({
    id: String(entry._id),
    action: entry.action,
    description: entry.description,
    previousValue: entry.previousValue,
    newValue: entry.newValue,
    performedBy: entry.performedBy?.toString(),
    createdAt: entry.createdAt,
  }));
};
