import { Agent } from '../models/agent.model';
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

export const createAgent = async (data: CreateAgentInput) => {
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

  return serializeAgent(created.toObject ? created.toObject() : created);
};

export const getAgentList = async (query: Record<string, any>) => {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  const filter: any = {};

  if (query.status) filter.status = query.status;
  if (query.serviceArea) filter.serviceArea = { $regex: query.serviceArea, $options: 'i' };
  if (query.search) {
    filter.$or = [
      { fullName: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
      { serviceArea: { $regex: query.search, $options: 'i' } },
    ];
  }

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

export const getAgentById = async (id: string) => {
  const cached = await cacheService.getCachedAgent(id);
  if (cached) {
    return cached;
  }

  const agent = await Agent.findById(id).lean();
  if (!agent) {
    const error: any = new Error('Delivery agent not found');
    error.statusCode = 404;
    throw error;
  }

  const serialized = serializeAgent(agent);
  await cacheService.setCachedAgent(id, serialized);
  return serialized;
};

export const updateAgent = async (id: string, data: UpdateAgentInput) => {
  const agent = await Agent.findById(id);
  if (!agent) {
    const error: any = new Error('Delivery agent not found');
    error.statusCode = 404;
    throw error;
  }

  if (data.email && data.email.toLowerCase() !== agent.email) {
    const existing = await Agent.findOne({ email: data.email.toLowerCase() });
    if (existing && existing._id.toString() !== id) {
      const error: any = new Error('Agent email already exists');
      error.statusCode = 409;
      throw error;
    }
  }

  Object.assign(agent, data);
  if (data.email) agent.email = data.email.toLowerCase();
  await agent.save({ validateBeforeSave: true });

  await cacheService.invalidateAgentCache(id);
  await cacheService.invalidateAgentListCaches();

  return serializeAgent(agent.toObject ? agent.toObject() : agent);
};

export const deleteAgent = async (id: string) => {
  const agent = await Agent.findByIdAndDelete(id);
  if (!agent) {
    const error: any = new Error('Delivery agent not found');
    error.statusCode = 404;
    throw error;
  }

  await cacheService.invalidateAgentCache(id);
  await cacheService.invalidateAgentListCaches();
  return null;
};
