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

// ─── AI Types ────────────────────────────────────────────────────────────────

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Company-level context injected by the backend into the system prompt */
export interface AIContext {
  companyName?: string;
  userRole: string;
  userDepartment?: string;
  projectSummaries?: Array<{
    name: string;
    status: string;
    progress: number;
    dueDate: string | null;
    taskCount: number;
  }>;
  teamSize?: number;
}

export interface AIRequest {
  message: string;
}

export interface AIResponse {
  reply: string;
  model: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}
