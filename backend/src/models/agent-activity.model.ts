import mongoose, { Document, Schema, Types } from 'mongoose';

export type AgentActivityAction =
  | 'AGENT_CREATED'
  | 'PROFILE_UPDATED'
  | 'STATUS_CHANGED'
  | 'SERVICE_AREA_CHANGED'
  | 'AGENT_DELETED';

export interface IAgentActivity extends Document {
  agentId: Types.ObjectId;
  action: AgentActivityAction;
  description: string;
  previousValue?: string;
  newValue?: string;
  performedBy?: Types.ObjectId;
  createdAt: Date;
}

const agentActivitySchema = new Schema<IAgentActivity>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
    action: {
      type: String,
      enum: ['AGENT_CREATED', 'PROFILE_UPDATED', 'STATUS_CHANGED', 'SERVICE_AREA_CHANGED', 'AGENT_DELETED'],
      required: true,
    },
    description: { type: String, required: true, trim: true },
    previousValue: { type: String },
    newValue: { type: String },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

agentActivitySchema.index({ agentId: 1, createdAt: -1 });

export const AgentActivity =
  mongoose.models.AgentActivity || mongoose.model<IAgentActivity>('AgentActivity', agentActivitySchema);