import request from 'supertest';
import app from '../src/app';
import { Agent } from '../src/models/agent.model';
import { AgentActivity } from '../src/models/agent-activity.model';
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
    await AgentActivity.deleteMany({});
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

  it('filters by repeated service areas and searches agent IDs', async () => {
    await request(app).post('/api/auth/register').send({ name: 'Admin User', email: 'filters@example.com', password: 'Password123!' });
    const login = await request(app).post('/api/auth/login').send({ email: 'filters@example.com', password: 'Password123!' });
    const token = `Bearer ${login.body.data.token}`;
    const created = await Promise.all([
      request(app).post('/api/agents').set('Authorization', token).send({ fullName: 'Delhi Agent', phoneNumber: '+919876543210', email: 'delhi@example.com', serviceArea: 'Delhi', status: 'ACTIVE' }),
      request(app).post('/api/agents').set('Authorization', token).send({ fullName: 'Noida Agent', phoneNumber: '+919876543211', email: 'noida@example.com', serviceArea: 'Noida', status: 'INACTIVE' }),
      request(app).post('/api/agents').set('Authorization', token).send({ fullName: 'Pune Agent', phoneNumber: '+919876543212', email: 'pune@example.com', serviceArea: 'Pune', status: 'ACTIVE' }),
    ]);

    const areaResponse = await request(app).get('/api/agents?serviceArea=Delhi&serviceArea=Noida').set('Authorization', token);
    const searchResponse = await request(app).get(`/api/agents?search=${created[0].body.data.agentId}`).set('Authorization', token);

    expect(areaResponse.status).toBe(200);
    expect(areaResponse.body.data.agents).toHaveLength(2);
    expect(searchResponse.body.data.agents.map((agent: { agentId: string }) => agent.agentId)).toContain(created[0].body.data.agentId);
  });

  it('returns live analytics to admins and rejects unauthenticated and non-admin requests', async () => {
    await request(app).post('/api/auth/register').send({ name: 'Admin User', email: 'analytics-admin@example.com', password: 'Password123!' });
    const adminLogin = await request(app).post('/api/auth/login').send({ email: 'analytics-admin@example.com', password: 'Password123!' });
    const adminToken = `Bearer ${adminLogin.body.data.token}`;
    await request(app).post('/api/agents').set('Authorization', adminToken).send({ fullName: 'Delhi Agent', phoneNumber: '+919876543210', email: 'analytics-delhi@example.com', serviceArea: 'Delhi', status: 'ACTIVE' });
    await request(app).post('/api/agents').set('Authorization', adminToken).send({ fullName: 'Pune Agent', phoneNumber: '+919876543211', email: 'analytics-pune@example.com', serviceArea: 'Pune', status: 'INACTIVE' });

    const unauthorized = await request(app).get('/api/analytics/overview');
    const overview = await request(app).get('/api/analytics/overview').set('Authorization', adminToken);
    await request(app).post('/api/auth/register').send({ name: 'Regular User', email: 'analytics-user@example.com', password: 'Password123!' });
    const userLogin = await request(app).post('/api/auth/login').send({ email: 'analytics-user@example.com', password: 'Password123!' });
    const forbidden = await request(app).get('/api/analytics/overview').set('Authorization', `Bearer ${userLogin.body.data.token}`);

    expect(unauthorized.status).toBe(401);
    expect(forbidden.status).toBe(403);
    expect(overview.status).toBe(200);
    expect(overview.body.data).toMatchObject({
      totalAgents: 2,
      activeAgents: 1,
      inactiveAgents: 1,
      serviceAreas: 2,
      statusDistribution: { ACTIVE: 1, INACTIVE: 1 },
      serviceAreaDistribution: [{ area: 'Delhi', count: 1 }, { area: 'Pune', count: 1 }],
    });
  });

  it('records agent activity for create, update, and delete and protects activity retrieval', async () => {
    await request(app).post('/api/auth/register').send({ name: 'Admin User', email: 'activity-admin@example.com', password: 'Password123!' });
    const adminLogin = await request(app).post('/api/auth/login').send({ email: 'activity-admin@example.com', password: 'Password123!' });
    const adminToken = `Bearer ${adminLogin.body.data.token}`;
    const created = await request(app).post('/api/agents').set('Authorization', adminToken).send({ fullName: 'Audit Agent', phoneNumber: '+919876543210', email: 'activity-agent@example.com', serviceArea: 'Delhi', status: 'ACTIVE' });
    const id = created.body.data.id;

    const createdActivity = await request(app).get(`/api/agents/${id}/activity`).set('Authorization', adminToken);
    await request(app).put(`/api/agents/${id}`).set('Authorization', adminToken).send({ status: 'INACTIVE' });
    await request(app).put(`/api/agents/${id}`).set('Authorization', adminToken).send({ serviceArea: 'Pune', fullName: 'Updated Audit Agent' });
    const updatedActivity = await request(app).get(`/api/agents/${id}/activity`).set('Authorization', adminToken);
    const unauthorized = await request(app).get(`/api/agents/${id}/activity`);
    await request(app).delete(`/api/agents/${id}`).set('Authorization', adminToken);
    const deletedActivity = await AgentActivity.findOne({ agentId: id, action: 'AGENT_DELETED' });
    const missingAgent = await request(app).get(`/api/agents/${id}/activity`).set('Authorization', adminToken);

    expect(createdActivity.body.data).toHaveLength(1);
    expect(createdActivity.body.data[0].action).toBe('AGENT_CREATED');
    expect(updatedActivity.body.data.slice(0, 3).map((entry: { action: string }) => entry.action)).toEqual([
      'PROFILE_UPDATED',
      'SERVICE_AREA_CHANGED',
      'STATUS_CHANGED',
    ]);
    expect(updatedActivity.body.data[1]).toMatchObject({ previousValue: 'Delhi', newValue: 'Pune' });
    expect(unauthorized.status).toBe(401);
    expect(deletedActivity).not.toBeNull();
    expect(missingAgent.status).toBe(404);
  });

  it('exports filtered agent data as escaped CSV for admins only', async () => {
    await request(app).post('/api/auth/register').send({ name: 'Admin User', email: 'csv-admin@example.com', password: 'Password123!' });
    const adminLogin = await request(app).post('/api/auth/login').send({ email: 'csv-admin@example.com', password: 'Password123!' });
    const adminToken = `Bearer ${adminLogin.body.data.token}`;
    await request(app).post('/api/agents').set('Authorization', adminToken).send({ fullName: 'Doe, "Jane"\nII', phoneNumber: '+919876543210', email: 'csv-delhi@example.com', serviceArea: 'Delhi', status: 'ACTIVE' });
    await request(app).post('/api/agents').set('Authorization', adminToken).send({ fullName: 'Other Active', phoneNumber: '+919876543211', email: 'csv-pune@example.com', serviceArea: 'Pune', status: 'ACTIVE' });
    await request(app).post('/api/agents').set('Authorization', adminToken).send({ fullName: 'Inactive Delhi', phoneNumber: '+919876543212', email: 'csv-inactive@example.com', serviceArea: 'Delhi', status: 'INACTIVE' });

    const unauthorized = await request(app).get('/api/agents/export');
    const exported = await request(app)
      .get('/api/agents/export?status=ACTIVE&serviceArea=Delhi&serviceArea=Pune')
      .set('Authorization', adminToken);

    expect(unauthorized.status).toBe(401);
    expect(exported.status).toBe(200);
    expect(exported.headers['content-type']).toContain('text/csv');
    expect(exported.headers['content-disposition']).toContain('agents.csv');
    expect(exported.text).toContain('"Agent ID","Full Name","Phone Number","Email","Service Area","Status","Created At","Updated At"');
    expect(exported.text).toContain('"Doe, ""Jane""\nII"');
    expect(exported.text).toContain('csv-delhi@example.com');
    expect(exported.text).toContain('csv-pune@example.com');
    expect(exported.text).not.toContain('csv-inactive@example.com');
  });
});
