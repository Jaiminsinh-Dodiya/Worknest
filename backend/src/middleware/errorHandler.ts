import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Handle Prisma unique constraint violation
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as { code?: string; meta?: { target?: string[] } };
    if (prismaErr.code === 'P2002') {
      const target = prismaErr.meta?.target?.join(', ') || 'field';
      res.status(409).json({
        success: false,
        error: `A record with this ${target} already exists.`,
      });
      return;
    }
  }

  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
};
