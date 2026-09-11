import { Router } from 'express';
import { z } from 'zod';
import { ProjectController } from '../controllers/project.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const statusEnum = z.enum(['Active', 'Completed', 'On Hold', 'OnHold']);

const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Project name must be at least 2 characters'),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    department: z.string().optional(),
    managerId: z.string().min(1, 'Manager is required'),
    teamMemberIds: z.array(z.string()).optional(),
    companyId: z.string().optional(),
    startDate: z.string().min(1, 'Start date is required'),
    dueDate: z.string().min(1, 'Due date is required'),
    status: statusEnum.optional(),
  }),
});

const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().min(5).optional(),
    department: z.string().optional(),
    managerId: z.string().optional(),
    teamMemberIds: z.array(z.string()).optional(),
    progress: z.number().min(0).max(100).optional(),
    status: statusEnum.optional(),
    startDate: z.string().optional(),
    dueDate: z.string().optional(),
  }),
});

router.use(authenticate);

// View projects
router.get('/', ProjectController.getAll);
router.get('/:id', ProjectController.getById);

// Manage projects (Company Owner, Manager, Super Admin)
router.post(
  '/',
  requirePermission('projects.manage'),
  validate(createProjectSchema),
  ProjectController.create
);

router.patch(
  '/:id',
  requirePermission('projects.manage'),
  validate(updateProjectSchema),
  ProjectController.update
);

export default router;
