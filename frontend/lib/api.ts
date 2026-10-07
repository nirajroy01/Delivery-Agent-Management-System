import axios from 'axios';
import { AuthUser, LoginInput, RegisterInput } from '@/types/auth';
import { Agent, AgentActivity, AgentFilters, CreateAgentInput, PaginatedAgentsResponse, UpdateAgentInput } from '@/types/agent';
import { AnalyticsOverview } from '@/types/analytics';
import { clearAuthSession, getStoredToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ error?: { message?: string } }>(error)) {
    return error.response?.data?.error?.message || fallback;
  }
  return fallback;
};

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

export const getAgents = async (params?: AgentFilters) => {
  const response = await api.get<{ success: boolean; data: PaginatedAgentsResponse }>('/agents', {
    params,
    paramsSerializer: { indexes: null },
  });
  return response.data.data;
};

export const getAnalyticsOverview = async () => {
  const response = await api.get<{ success: boolean; data: AnalyticsOverview }>('/analytics/overview');
  return response.data.data;
};

export const getAgentActivity = async (id: string) => {
  const response = await api.get<{ success: boolean; data: AgentActivity[] }>(`/agents/${id}/activity`);
  return response.data.data;
};

export const exportAgentsCsv = async (filters: Pick<AgentFilters, 'search' | 'status' | 'serviceArea'>) => {
  const response = await api.get<Blob>('/agents/export', {
    params: filters,
    paramsSerializer: { indexes: null },
    responseType: 'blob',
  });
  return response.data;
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
