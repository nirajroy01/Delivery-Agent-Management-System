import { connectDatabase } from '../config/database';
import { Agent } from '../models/agent.model';
import { generateAgentId } from '../utils/agent-id';

const sampleAgents = [
  { fullName: 'Aarav Kumar', phoneNumber: '+919876543201', email: 'aarav1@example.com', serviceArea: 'Bangalore', status: 'ACTIVE' },
  { fullName: 'Neha Patel', phoneNumber: '+919876543202', email: 'neha2@example.com', serviceArea: 'Mumbai', status: 'ACTIVE' },
  { fullName: 'Rohan Shah', phoneNumber: '+919876543203', email: 'rohan3@example.com', serviceArea: 'Delhi', status: 'INACTIVE' },
  { fullName: 'Sana Iqbal', phoneNumber: '+919876543204', email: 'sana4@example.com', serviceArea: 'Hyderabad', status: 'ACTIVE' },
  { fullName: 'Vikram Nair', phoneNumber: '+919876543205', email: 'vikram5@example.com', serviceArea: 'Chennai', status: 'ACTIVE' },
  { fullName: 'Meera Joshi', phoneNumber: '+919876543206', email: 'meera6@example.com', serviceArea: 'Pune', status: 'INACTIVE' },
  { fullName: 'Ishita Sen', phoneNumber: '+919876543207', email: 'ishita7@example.com', serviceArea: 'Kolkata', status: 'ACTIVE' },
  { fullName: 'Karan Singh', phoneNumber: '+919876543208', email: 'karan8@example.com', serviceArea: 'Ahmedabad', status: 'ACTIVE' },
  { fullName: 'Priya Desai', phoneNumber: '+919876543209', email: 'priya9@example.com', serviceArea: 'Bangalore', status: 'INACTIVE' },
  { fullName: 'Aniket Rao', phoneNumber: '+919876543210', email: 'aniket10@example.com', serviceArea: 'Delhi', status: 'ACTIVE' },
];

const runSeed = async () => {
  await connectDatabase();
  await Agent.deleteMany({});

  for (const item of sampleAgents) {
    await Agent.create({
      ...item,
      email: item.email.toLowerCase(),
      agentId: await generateAgentId(),
    });
  }

  console.log('[INFO] Seeded 10 sample delivery agents');
  process.exit(0);
};

runSeed().catch((error) => {
  console.error('[ERROR] Seed failed:', error);
  process.exit(1);
});
