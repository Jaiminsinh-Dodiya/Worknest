import { Router } from 'express';
import { z } from 'zod';
import { UserController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const roleEnum = z.enum(['SUPER_ADMIN', 'COMPANY_OWNER', 'HR', 'MANAGER', 'EMPLOYEE']);

const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    phone: z.string().optional(),
    role: roleEnum,
    department: z.string().min(2, 'Department is required'),
    companyId: z.string().optional(),
  }),
});

const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    department: z.string().optional(),
    role: roleEnum.optional(),
    avatar: z.string().optional(),
  }),
});

router.use(authenticate);

// View users
router.get('/', UserController.getAll);
router.get('/:id', UserController.getById);

// Manage users (requires users.manage)
router.post('/', requirePermission('users.manage'), validate(createUserSchema), UserController.create);
router.patch('/:id', validate(updateUserSchema), UserController.update);
router.patch('/:id/status', requirePermission('users.manage'), UserController.toggleStatus);

export default router;
