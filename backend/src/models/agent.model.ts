import mongoose, { Schema, Document } from 'mongoose';
import { AgentStatus } from '../types/agent.types';

export interface IAgent extends Document {
  agentId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  serviceArea: string;
  status: AgentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const agentSchema = new Schema<IAgent>(
  {
    agentId: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    serviceArea: { type: String, required: true, trim: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], required: true },
  },
  { timestamps: true },
);

agentSchema.index({ status: 1 });
agentSchema.index({ serviceArea: 1 });

export const Agent = mongoose.models.Agent || mongoose.model<IAgent>('Agent', agentSchema);
