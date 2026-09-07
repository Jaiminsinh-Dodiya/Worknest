import { Router } from 'express';
import { z } from 'zod';
import { AIController } from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Zod schema: reject empty messages, missing message, >4000 chars
const chatSchema = z.object({
  body: z.object({
    message: z
      .string({ required_error: 'message is required' })
      .min(1, 'message cannot be empty')
      .max(4000, 'message must not exceed 4000 characters'),
  }),
});

// All AI routes require a valid JWT
router.use(authenticate);

// POST /api/ai/chat
router.post('/chat', validate(chatSchema), AIController.chat);

export default router;
