import request from 'supertest';
import app from '../src/app';
import { Agent } from '../src/models/agent.model';
import { User } from '../src/models/user.model';

const createUser = async (role: 'USER' | 'ADMIN' = 'ADMIN') => {
  const user = await User.create({
    name: role === 'ADMIN' ? 'Admin' : 'User',
    email: `${role.toLowerCase()}${Date.now()}@example.com`,
    passwordHash: 'hashed-password',
    role,
  });

  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password: 'Password123!' });

  if (loginResponse.status !== 200) {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({ name: user.name, email: user.email, password: 'Password123!' });

    return registerResponse.body.data;
  }

  return { token: loginResponse.body.data.token, user: loginResponse.body.data.user };
};

describe('Agent API', () => {
  beforeEach(async () => {
    await Agent.deleteMany({});
    await User.deleteMany({});
  });

  it('creates an agent successfully as admin', async () => {
    const admin = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Admin User', email: 'admin@example.com', password: 'Password123!' });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'Password123!' });

    const response = await request(app)
      .post('/api/agents')
      .set('Authorization', `Bearer ${login.body.data.token}`)
      .send({ fullName: 'Rahul Sharma', phoneNumber: '+919876543210', email: 'rahul@example.com', serviceArea: 'Bangalore', status: 'ACTIVE' });

    expect(response.status).toBe(201);
    expect(response.body.data.agentId).toMatch(/^AGT-/);
  });

  it('rejects missing required fields', async () => {
    const admin = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Admin User', email: 'admin2@example.com', password: 'Password123!' });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin2@example.com', password: 'Password123!' });

    const response = await request(app)
      .post('/api/agents')
      .set('Authorization', `Bearer ${login.body.data.token}`)
      .send({ fullName: '', phoneNumber: '', email: 'bad', serviceArea: '', status: 'ACTIVE' });

    expect(response.status).toBe(422);
  });

  it('rejects duplicate email', async () => {
    const admin = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Admin User', email: 'admin3@example.com', password: 'Password123!' });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin3@example.com', password: 'Password123!' });

    await request(app)
      .post('/api/agents')
      .set('Authorization', `Bearer ${login.body.data.token}`)
      .send({ fullName: 'Rahul Sharma', phoneNumber: '+919876543210', email: 'rahul@example.com', serviceArea: 'Bangalore', status: 'ACTIVE' });

    const response = await request(app)
      .post('/api/agents')
      .set('Authorization', `Bearer ${login.body.data.token}`)
      .send({ fullName: 'Another', phoneNumber: '+919876543211', email: 'rahul@example.com', serviceArea: 'Mumbai', status: 'INACTIVE' });

    expect(response.status).toBe(409);
  });

  it('allows normal users to list agents', async () => {
    const registerUser = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Regular User', email: 'user@example.com', password: 'Password123!' });
    const login = await request(app).post('/api/auth/login').send({ email: 'user@example.com', password: 'Password123!' });

    const response = await request(app).get('/api/agents?page=1&limit=10').set('Authorization', `Bearer ${login.body.data.token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
