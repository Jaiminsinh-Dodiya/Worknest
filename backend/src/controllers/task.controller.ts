import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service.js';
import { UnauthorizedError } from '../utils/errors.js';

export class TaskController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const projectId = req.query.projectId as string | undefined;
      const tasks = await TaskService.getTasks(req.user, projectId);
      res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const tasks = await TaskService.getMyTasks(req.user);
      res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const task = await TaskService.getTaskById(req.params.id, req.user);
      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const task = await TaskService.createTask(req.body, req.user);
      res.status(201).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const task = await TaskService.updateTask(req.params.id, req.body, req.user);
      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await TaskService.deleteTask(req.params.id, req.user);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
