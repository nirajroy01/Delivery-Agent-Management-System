export type AgentStatus = 'ACTIVE' | 'INACTIVE';

export type Agent = {
  id: string;
  agentId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  serviceArea: string;
  status: AgentStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateAgentInput = {
  fullName: string;
  phoneNumber: string;
  email: string;
  serviceArea: string;
  status: AgentStatus;
};

export type UpdateAgentInput = Partial<CreateAgentInput>;

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedAgentsResponse = {
  agents: Agent[];
  pagination: Pagination;
};

export type ApiError = {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
};
