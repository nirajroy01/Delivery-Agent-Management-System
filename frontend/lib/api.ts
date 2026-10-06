import axios from 'axios';
import { AuthUser, LoginInput, RegisterInput } from '@/types/auth';
import { Agent, CreateAgentInput, PaginatedAgentsResponse, UpdateAgentInput } from '@/types/agent';
import { clearAuthSession, getStoredToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = async (payload: RegisterInput) => {
  const response = await api.post<{ success: boolean; data: AuthUser; message?: string }>('/auth/register', payload);
  return response.data;
};

export const login = async (payload: LoginInput) => {
  const response = await api.post<{ success: boolean; data: { token: string; user: AuthUser } }>('/auth/login', payload);
  return response.data;
};

export const logout = () => {
  clearAuthSession();
};

export const getCurrentUser = async () => {
  const response = await api.get<{ success: boolean; data: AuthUser }>('/auth/me');
  return response.data.data;
};

export const getAgents = async (params?: Record<string, string | number | undefined>) => {
  const response = await api.get<{ success: boolean; data: PaginatedAgentsResponse }>('/agents', { params });
  return response.data.data;
};

export const getAgent = async (id: string) => {
  const response = await api.get<{ success: boolean; data: Agent }>(`/agents/${id}`);
  return response.data.data;
};

export const createAgent = async (payload: CreateAgentInput) => {
  const response = await api.post<{ success: boolean; data: Agent; message?: string }>('/agents', payload);
  return response.data;
};

export const updateAgent = async (id: string, payload: UpdateAgentInput) => {
  const response = await api.put<{ success: boolean; data: Agent; message?: string }>(`/agents/${id}`, payload);
  return response.data;
};

export const deleteAgent = async (id: string) => {
  await api.delete(`/agents/${id}`);
};

export default api;
