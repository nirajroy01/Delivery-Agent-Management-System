import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/user.model';

describe('Auth API', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('returns a health status endpoint', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('API is healthy');
    expect(response.body.environment).toBe('test');
  });

  it('registers a user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Admin User', email: 'admin@example.com', password: 'Password123!' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('admin@example.com');
  });

  it('rejects duplicate emails', async () => {
    await request(app).post('/api/auth/register').send({ name: 'Admin User', email: 'admin@example.com', password: 'Password123!' });

    const response = await request(app).post('/api/auth/register').send({ name: 'Second User', email: 'admin@example.com', password: 'Password123!' });

    expect(response.status).toBe(409);
  });

  it('logs in a user with valid credentials', async () => {
    await request(app).post('/api/auth/register').send({ name: 'Admin User', email: 'admin@example.com', password: 'Password123!' });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'Password123!' });

    expect(response.status).toBe(200);
    expect(response.body.data.token).toBeTruthy();
  });

  it('rejects invalid login credentials', async () => {
    await request(app).post('/api/auth/register').send({ name: 'Admin User', email: 'admin@example.com', password: 'Password123!' });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'WrongPassword' });

    expect(response.status).toBe(401);
  });

  it('requires a token for protected routes', async () => {
    const response = await request(app).get('/api/auth/me');
    expect(response.status).toBe(401);
  });

  it('rejects invalid tokens', async () => {
    const response = await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalid-token');
    expect(response.status).toBe(401);
  });
});
