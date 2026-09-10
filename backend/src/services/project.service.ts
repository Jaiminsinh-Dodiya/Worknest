import { ProjectStatus } from '@prisma/client';
import { prisma } from '../utils/prisma.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { TokenPayload } from '../types/index.js';

export interface CreateProjectDTO {
  name: string;
  description: string;
  managerId: string;
  teamMemberIds?: string[];
  companyId?: string;
  startDate: string | Date;
  dueDate: string | Date;
  status?: 'Active' | 'Completed' | 'On Hold' | 'OnHold';
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
  managerId?: string;
  teamMemberIds?: string[];
  progress?: number;
  status?: 'Active' | 'Completed' | 'On Hold' | 'OnHold';
  startDate?: string | Date;
  dueDate?: string | Date;
}

// Convert frontend "On Hold" to Prisma enum "OnHold"
const mapStatusToDb = (status?: string): ProjectStatus | undefined => {
  if (!status) return undefined;
  if (status === 'On Hold' || status === 'OnHold') return ProjectStatus.OnHold;
  if (status === 'Completed') return ProjectStatus.Completed;
  return ProjectStatus.Active;
};

// Convert DB enum "OnHold" to "On Hold" for frontend compatibility
const mapProjectForClient = (project: any) => {
  return {
    ...project,
    status: project.status === 'OnHold' ? 'On Hold' : project.status,
    teamMemberIds: project.teamMembers ? project.teamMembers.map((m: any) => m.id) : [],
  };
};

export class ProjectService {
  /**
   * Get projects scoped by user's role and company
   */
  static async getProjects(user: TokenPayload) {
    if (user.role === 'SUPER_ADMIN') {
      const projects = await prisma.project.findMany({
        include: {
          manager: {
            select: { id: true, name: true, email: true, role: true },
          },
          teamMembers: {
            select: { id: true, name: true, email: true, role: true },
          },
          company: {
            select: { id: true, name: true },
          },
          _count: {
            select: { tasks: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return projects.map(mapProjectForClient);
    }

    if (!user.companyId) {
      throw new ForbiddenError('User has no company association');
    }

    // Role-specific scoping inside company
    let whereClause: any = { companyId: user.companyId };

    if (user.role === 'EMPLOYEE') {
      whereClause.teamMembers = {
        some: { id: user.userId },
      };
    } else if (user.role === 'MANAGER') {
      whereClause.OR = [
        { managerId: user.userId },
        { teamMembers: { some: { id: user.userId } } },
      ];
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        manager: {
          select: { id: true, name: true, email: true, role: true },
        },
        teamMembers: {
          select: { id: true, name: true, email: true, role: true },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map(mapProjectForClient);
  }

  /**
   * Get single project by ID with scope validation
   */
  static async getProjectById(projectId: string, user: TokenPayload) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        manager: {
          select: { id: true, name: true, email: true, role: true },
        },
        teamMembers: {
          select: { id: true, name: true, email: true, role: true },
        },
        tasks: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        company: {
          select: { id: true, name: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Check tenant isolation
    if (user.role !== 'SUPER_ADMIN') {
      if (project.companyId !== user.companyId) {
        throw new ForbiddenError('Access denied to other company project');
      }

      // Check role visibility
      if (user.role === 'EMPLOYEE') {
        const isMember = project.teamMembers.some((m) => m.id === user.userId);
        if (!isMember) {
          throw new ForbiddenError('Access denied: You are not a member of this project');
        }
      }
    }

    return mapProjectForClient(project);
  }

  /**
   * Create a new project
   */
  static async createProject(data: CreateProjectDTO, creator: TokenPayload) {
    const targetCompanyId = creator.role === 'SUPER_ADMIN' ? data.companyId : creator.companyId;

    if (!targetCompanyId) {
      throw new ForbiddenError('Company ID required to create project');
    }

    const dbStatus = mapStatusToDb(data.status);

    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        managerId: data.managerId,
        companyId: targetCompanyId,
        startDate: new Date(data.startDate),
        dueDate: new Date(data.dueDate),
        status: dbStatus,
        progress: 0,
        teamMembers: data.teamMemberIds?.length
          ? { connect: data.teamMemberIds.map((id) => ({ id })) }
          : undefined,
      },
      include: {
        manager: {
          select: { id: true, name: true, email: true },
        },
        teamMembers: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return mapProjectForClient(project);
  }

  /**
   * Update project details
   */
  static async updateProject(projectId: string, data: UpdateProjectDTO, user: TokenPayload) {
    const existing = await prisma.project.findUnique({
      where: { id: projectId },
      include: { teamMembers: true },
    });

    if (!existing) {
      throw new NotFoundError('Project not found');
    }

    if (user.role !== 'SUPER_ADMIN' && existing.companyId !== user.companyId) {
      throw new ForbiddenError('Cannot modify projects outside your company');
    }

    const dbStatus = mapStatusToDb(data.status);

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: data.name,
        description: data.description,
        managerId: data.managerId,
        progress: data.progress,
        status: dbStatus,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        teamMembers: data.teamMemberIds
          ? {
              set: data.teamMemberIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        manager: {
          select: { id: true, name: true, email: true },
        },
        teamMembers: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return mapProjectForClient(updated);
  }
}
