import { Router } from 'express';
import { createAgentController, deleteAgentController, getAgentController, getAgentsController, updateAgentController } from '../controllers/agent.controller';
import { authMiddleware, requireAdmin } from '../middleware/auth.middleware';
import { validate, validateQuery } from '../middleware/validation.middleware';
import { agentCreateSchema, agentQuerySchema, agentUpdateSchema } from '../schemas/agent.schema';

const router = Router();

router.use(authMiddleware);

router.get('/', validateQuery(agentQuerySchema), getAgentsController);
router.get('/:id', getAgentController);
router.post('/', requireAdmin, validate(agentCreateSchema), createAgentController);
router.put('/:id', requireAdmin, validate(agentUpdateSchema), updateAgentController);
router.delete('/:id', requireAdmin, deleteAgentController);

export default router;
