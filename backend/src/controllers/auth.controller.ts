import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { UnauthorizedError } from '../utils/errors.js';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new UnauthorizedError('Refresh token required');
      }
      const result = await AuthService.refreshToken(refreshToken);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async logout(_req: Request, res: Response): Promise<void> {
    // With stateless JWTs, frontend clears tokens from storage.
    // An endpoint is provided for clean architectural symmetry.
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Not authenticated');
      }
      const user = await AuthService.getCurrentUser(req.user.userId);
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async demoAccounts(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accounts = await AuthService.getDemoAccounts();
      res.status(200).json({
        success: true,
        data: accounts,
      });
    } catch (error) {
      next(error);
    }
  }
}
