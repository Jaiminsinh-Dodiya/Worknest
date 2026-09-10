import { prisma } from '../utils/prisma.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { TokenPayload } from '../types/index.js';

export interface CreateCompanyDTO {
  name: string;
  industry: string;
  size: string;
  plan?: string;
}

export class CompanyService {
  /**
   * Super Admin only: List all registered companies
   */
  static async getAllCompanies() {
    return prisma.company.findMany({
      include: {
        _count: {
          select: {
            users: true,
            projects: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get single company by ID (with tenant check)
   */
  static async getCompanyById(id: string, user: TokenPayload) {
    if (user.role !== 'SUPER_ADMIN' && user.companyId !== id) {
      throw new ForbiddenError('Access denied to other company data');
    }

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            projects: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundError('Company not found');
    }

    return company;
  }

  /**
   * Super Admin only: Create a new company
   */
  static async createCompany(data: CreateCompanyDTO) {
    return prisma.company.create({
      data: {
        name: data.name,
        industry: data.industry,
        size: data.size,
        plan: data.plan || 'Starter',
      },
    });
  }
}
