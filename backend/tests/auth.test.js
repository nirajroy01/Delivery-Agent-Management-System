"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
const user_model_1 = require("../src/models/user.model");
describe('Auth API', () => {
    beforeEach(async () => {
        await user_model_1.User.deleteMany({});
    });
    it('registers a user successfully', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send({ name: 'Admin User', email: 'admin@example.com', password: 'Password123!' });
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.email).toBe('admin@example.com');
    });
    it('rejects duplicate emails', async () => {
        await (0, supertest_1.default)(app_1.default).post('/api/auth/register').send({ name: 'Admin User', email: 'admin@example.com', password: 'Password123!' });
        const response = await (0, supertest_1.default)(app_1.default).post('/api/auth/register').send({ name: 'Second User', email: 'admin@example.com', password: 'Password123!' });
        expect(response.status).toBe(409);
    });
    it('logs in a user with valid credentials', async () => {
        await (0, supertest_1.default)(app_1.default).post('/api/auth/register').send({ name: 'Admin User', email: 'admin@example.com', password: 'Password123!' });
        const response = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({ email: 'admin@example.com', password: 'Password123!' });
        expect(response.status).toBe(200);
        expect(response.body.data.token).toBeTruthy();
    });
    it('rejects invalid login credentials', async () => {
        await (0, supertest_1.default)(app_1.default).post('/api/auth/register').send({ name: 'Admin User', email: 'admin@example.com', password: 'Password123!' });
        const response = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({ email: 'admin@example.com', password: 'WrongPassword' });
        expect(response.status).toBe(401);
    });
    it('requires a token for protected routes', async () => {
        const response = await (0, supertest_1.default)(app_1.default).get('/api/auth/me');
        expect(response.status).toBe(401);
    });
    it('rejects invalid tokens', async () => {
        const response = await (0, supertest_1.default)(app_1.default).get('/api/auth/me').set('Authorization', 'Bearer invalid-token');
        expect(response.status).toBe(401);
    });
});
//# sourceMappingURL=auth.test.js.map