import mongoose, { Schema } from 'mongoose';

const CounterSchema = new Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 10000 },
  },
  { versionKey: false },
);

const AgentCounter =
  mongoose.models.AgentCounter || mongoose.model('AgentCounter', CounterSchema, 'agent_counters');

export const generateAgentId = async (): Promise<string> => {
  const counter = await AgentCounter.findOneAndUpdate(
    { _id: 'agentId' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  if (!counter || typeof counter.seq !== 'number') {
    throw new Error('Failed to generate agent id');
  }

  return `AGT-${counter.seq}`;
};
