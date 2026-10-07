export type AgentStatus = 'ACTIVE' | 'INACTIVE';

export interface CreateAgentInput {
  fullName: string;
  phoneNumber: string;
  email: string;
  serviceArea: string;
  status: AgentStatus;
}

export interface UpdateAgentInput {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  serviceArea?: string | string[];
  status?: AgentStatus;
}

export interface AgentFilters {
  page?: number;
  limit?: number;
  status?: string;
  serviceArea?: string;
  search?: string;
}

export interface AgentDocument {
  id: string;
  agentId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  serviceArea: string;
  status: AgentStatus;
  createdAt: Date;
  updatedAt: Date;
}
