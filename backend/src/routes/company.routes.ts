import { Router } from 'express';
import { z } from 'zod';
import { CompanyController } from '../controllers/company.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const createCompanySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Company name must be at least 2 characters'),
    industry: z.string().min(2, 'Industry is required'),
    size: z.string().min(1, 'Company size is required'),
    plan: z.enum(['Starter', 'Professional', 'Enterprise']).optional(),
  }),
});

// Admin-only company routes
router.get('/admin/companies', authenticate, requireRole('SUPER_ADMIN'), CompanyController.getAll);
router.post(
  '/admin/companies',
  authenticate,
  requireRole('SUPER_ADMIN'),
  validate(createCompanySchema),
  CompanyController.create
);

// Tenant-scoped company route
router.get('/companies/:id', authenticate, CompanyController.getById);

export default router;
