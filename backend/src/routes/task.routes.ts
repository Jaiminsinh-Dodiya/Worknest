import { Router } from 'express';
import { z } from 'zod';
import { TaskController } from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const priorityEnum = z.enum(['High', 'Medium', 'Low']);
const statusEnum = z.enum(['Todo', 'In Progress', 'InProgress', 'Completed']);

const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Task title is required'),
    description: z.string().min(5, 'Task description is required'),
    projectId: z.string().min(1, 'Project ID is required'),
    assigneeId: z.string().min(1, 'Assignee ID is required'),
    priority: priorityEnum.optional(),
    status: statusEnum.optional(),
    dueDate: z.string().min(1, 'Due date is required'),
  }),
});

const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().min(5).optional(),
    assigneeId: z.string().optional(),
    priority: priorityEnum.optional(),
    status: statusEnum.optional(),
    dueDate: z.string().optional(),
  }),
});

router.use(authenticate);

// View tasks
router.get('/', TaskController.getAll);
router.get('/my', TaskController.getMyTasks);
router.get('/:id', TaskController.getById);

// Create task (requires tasks.manage)
router.post(
  '/',
  requirePermission('tasks.manage'),
  validate(createTaskSchema),
  TaskController.create
);

// Update task (handled inside service: employees can update own status; managers/owners can update full task)
router.patch(
  '/:id',
  validate(updateTaskSchema),
  TaskController.update
);

// Delete task (requires tasks.manage)
router.delete(
  '/:id',
  requirePermission('tasks.manage'),
  TaskController.delete
);

export default router;
