import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/ai.service.js';
import { UnauthorizedError } from '../utils/errors.js';

export class AIController {
  /**
   * POST /api/ai/chat
   * Body: { message: string }
   * Requires: JWT authentication (role and companyId come from token — never from body)
   */
  static async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();

      const { message } = req.body as { message: string };
      const result = await AIService.chat(message, req.user);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
