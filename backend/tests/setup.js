"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1d';
process.env.REDIS_URL = 'redis://localhost:6379';
const mongodb_memory_server_1 = require("mongodb-memory-server");
const database_1 = require("../src/config/database");
let mongoServer;
beforeAll(async () => {
    mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    await (0, database_1.connectDatabase)();
});
afterAll(async () => {
    await (0, database_1.disconnectDatabase)();
    if (mongoServer) {
        await mongoServer.stop();
    }
});
//# sourceMappingURL=setup.js.map