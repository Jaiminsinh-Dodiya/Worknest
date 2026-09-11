import { Request, Response, NextFunction } from 'express';
import { CompanyService } from '../services/company.service.js';
import { UnauthorizedError } from '../utils/errors.js';

export class CompanyController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companies = await CompanyService.getAllCompanies();
      res.status(200).json({
        success: true,
        data: companies,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const id = req.params.id as string;
      const company = await CompanyService.getCompanyById(id, req.user);
      res.status(200).json({
        success: true,
        data: company,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const company = await CompanyService.createCompany(req.body);
      res.status(201).json({
        success: true,
        data: company,
      });
    } catch (error) {
      next(error);
    }
  }
}
