import { Role, UserStatus } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
  companyId: string | null;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  companyId: string | null;
  status: UserStatus;
  avatar: string | null;
  phone?: string | null;
  joinedAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
