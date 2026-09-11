import { TaskPriority, TaskStatus } from '@prisma/client';
import { prisma } from '../utils/prisma.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { TokenPayload } from '../types/index.js';

export interface CreateTaskDTO {
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  priority?: 'High' | 'Medium' | 'Low';
  status?: 'Todo' | 'In Progress' | 'InProgress' | 'Completed';
  dueDate: string | Date;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  assigneeId?: string;
  priority?: 'High' | 'Medium' | 'Low';
  status?: 'Todo' | 'In Progress' | 'InProgress' | 'Completed';
  dueDate?: string | Date;
}

const mapStatusToDb = (status?: string): TaskStatus | undefined => {
  if (!status) return undefined;
  if (status === 'In Progress' || status === 'InProgress') return TaskStatus.InProgress;
  if (status === 'Completed') return TaskStatus.Completed;
  return TaskStatus.Todo;
};

const mapTaskForClient = (task: any) => {
  return {
    ...task,
    status: task.status === 'InProgress' ? 'In Progress' : task.status,
  };
};

export class TaskService {
  /**
   * Get tasks scoped by user role and company
   */
  static async getTasks(user: TokenPayload, projectId?: string) {
    if (user.role === 'SUPER_ADMIN') {
      const tasks = await prisma.task.findMany({
        where: projectId ? { projectId } : undefined,
        include: {
          assignee: { select: { id: true, name: true, email: true, role: true } },
          project: { select: { id: true, name: true, companyId: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return tasks.map(mapTaskForClient);
    }

    if (!user.companyId) {
      throw new ForbiddenError('User has no company association');
    }

    let whereClause: any = {
      project: { companyId: user.companyId },
    };

    if (projectId) {
      whereClause.projectId = projectId;
    }

    if (user.role === 'EMPLOYEE') {
      whereClause.assigneeId = user.userId;
    } else if (user.role === 'MANAGER') {
      const managerUser = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { department: true },
      });
      if (managerUser?.department) {
        whereClause.OR = [
          { assigneeId: user.userId },
          { assignee: { department: managerUser.department } },
        ];
      }
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assignee: { select: { id: true, name: true, email: true, role: true } },
        project: { select: { id: true, name: true, companyId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tasks.map(mapTaskForClient);
  }

  /**
   * Get tasks assigned directly to the current user ("My Tasks")
   */
  static async getMyTasks(user: TokenPayload) {
    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: user.userId,
      },
      include: {
        project: { select: { id: true, name: true, companyId: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    return tasks.map(mapTaskForClient);
  }

  /**
   * Get single task by ID with scope validation
   */
  static async getTaskById(taskId: string, user: TokenPayload) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: { select: { id: true, name: true, email: true, role: true } },
        project: { select: { id: true, name: true, companyId: true } },
      },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    if (user.role !== 'SUPER_ADMIN') {
      if (task.project.companyId !== user.companyId) {
        throw new ForbiddenError('Access denied to other company task');
      }

      if (user.role === 'EMPLOYEE' && task.assigneeId !== user.userId) {
        throw new ForbiddenError('Access denied: You are not assigned to this task');
      }
    }

    return mapTaskForClient(task);
  }

  /**
   * Create a new task
   */
  static async createTask(data: CreateTaskDTO, user: TokenPayload) {
    // Verify project belongs to user's company
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    if (user.role !== 'SUPER_ADMIN' && project.companyId !== user.companyId) {
      throw new ForbiddenError('Cannot add tasks to other company projects');
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        assigneeId: data.assigneeId,
        priority: data.priority ? (data.priority as TaskPriority) : TaskPriority.Medium,
        status: mapStatusToDb(data.status) || TaskStatus.Todo,
        dueDate: new Date(data.dueDate),
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    return mapTaskForClient(task);
  }

  /**
   * Update task details (status updates allowed for assignees)
   */
  static async updateTask(taskId: string, data: UpdateTaskDTO, user: TokenPayload) {
    const existing = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!existing) {
      throw new NotFoundError('Task not found');
    }

    if (user.role !== 'SUPER_ADMIN' && existing.project.companyId !== user.companyId) {
      throw new ForbiddenError('Cannot modify tasks outside your company');
    }

    // Role-specific edit check:
    // If EMPLOYEE, can only update status if they are the assignee
    if (user.role === 'EMPLOYEE') {
      if (existing.assigneeId !== user.userId) {
        throw new ForbiddenError('Employees can only update tasks assigned to them');
      }

      // Employees cannot change title, description, assignee, priority, or due date
      const updated = await prisma.task.update({
        where: { id: taskId },
        data: {
          status: mapStatusToDb(data.status),
        },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } },
        },
      });

      return mapTaskForClient(updated);
    }

    // Managers, Owners, and Super Admins can update all fields
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        description: data.description,
        assigneeId: data.assigneeId,
        priority: data.priority as TaskPriority,
        status: mapStatusToDb(data.status),
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    return mapTaskForClient(updated);
  }

  /**
   * Delete a task
   */
  static async deleteTask(taskId: string, user: TokenPayload) {
    const existing = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!existing) {
      throw new NotFoundError('Task not found');
    }

    if (user.role !== 'SUPER_ADMIN' && existing.project.companyId !== user.companyId) {
      throw new ForbiddenError('Cannot delete tasks outside your company');
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return { success: true, message: 'Task deleted successfully' };
  }
}
