import { env } from '../config/env.js';
import { prisma } from '../utils/prisma.js';
import { TokenPayload, AIContext, AIResponse } from '../types/index.js';
import { AppError } from '../utils/errors.js';

// ─── Context Builder ─────────────────────────────────────────────────────────

/**
 * Fetch tenant-scoped context for the AI system prompt.
 * All queries are gated by user.companyId — no cross-tenant data leaks.
 */
async function buildContext(user: TokenPayload): Promise<AIContext> {
  const context: AIContext = {
    userRole: user.role,
  };

  try {
    // 1. Fetch authenticated user profile
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { name: true, department: true },
    });
    if (currentUser) {
      context.userName = currentUser.name;
      context.userDepartment = currentUser.department;
    }

    // 2. Handle SUPER_ADMIN platform-level scope
    if (!user.companyId || user.role === 'SUPER_ADMIN') {
      const [totalCompanies, totalUsers, companyList] = await Promise.all([
        prisma.company.count(),
        prisma.user.count({ where: { status: 'Active' } }),
        prisma.company.findMany({
          take: 5,
          select: {
            name: true,
            plan: true,
            _count: { select: { users: true, projects: true } },
          },
        }),
      ]);

      context.platformSummary = {
        totalCompanies,
        totalUsers,
        companies: companyList.map((c) => ({
          name: c.name,
          plan: c.plan,
          userCount: c._count.users,
          projectCount: c._count.projects,
        })),
      };

      return context;
    }

    // 3. Tenant-Scoped Company Context
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: { name: true },
    });
    if (company) context.companyName = company.name;

    // Team headcount & department breakdown (strictly within company)
    const activeUsers = await prisma.user.findMany({
      where: { companyId: user.companyId, status: 'Active' },
      select: { department: true },
    });
    context.teamSize = activeUsers.length;

    const deptCounts: Record<string, number> = {};
    for (const u of activeUsers) {
      const dept = u.department || 'General';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    }
    context.departmentCounts = deptCounts;

    const now = new Date();

    // 4. Task Prioritization: Fetch user's assigned active tasks
    const userTasks = await prisma.task.findMany({
      where: {
        assigneeId: user.userId,
        project: { companyId: user.companyId },
        status: { not: 'Completed' },
      },
      select: {
        title: true,
        priority: true,
        status: true,
        dueDate: true,
        project: { select: { name: true } },
      },
      orderBy: [{ dueDate: 'asc' }, { priority: 'asc' }],
      take: 10,
    });

    context.userTasks = userTasks.map((t) => ({
      title: t.title,
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate ? t.dueDate.toISOString().split('T')[0] : null,
      isOverdue: t.dueDate ? (now > t.dueDate && t.status !== 'Completed') : false,
      projectName: t.project.name,
    }));

    // 5. Project Analysis: Fetch company projects with health & task metrics
    const projects = await prisma.project.findMany({
      where: { companyId: user.companyId },
      select: {
        name: true,
        status: true,
        progress: true,
        dueDate: true,
        manager: { select: { name: true } },
        tasks: {
          select: {
            status: true,
            dueDate: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    });

    context.projectSummaries = projects.map((p) => {
      const taskCount = p.tasks.length;
      const completedTasks = p.tasks.filter((t) => t.status === 'Completed').length;
      const overdueTasks = p.tasks.filter(
        (t) => t.status !== 'Completed' && now > t.dueDate
      ).length;
      const isOverdue = p.dueDate ? (now > p.dueDate && p.status !== 'Completed') : false;

      return {
        name: p.name,
        status: p.status === 'OnHold' ? 'On Hold' : p.status,
        progress: p.progress,
        dueDate: p.dueDate ? p.dueDate.toISOString().split('T')[0] : null,
        isOverdue,
        taskCount,
        completedTasks,
        overdueTasks,
        managerName: p.manager?.name,
      };
    });
  } catch (err) {
    // Context building is best-effort — DB issues should not crash the gateway
    console.warn('[AI] Failed to build enriched context:', (err as Error).message);
  }

  return context;
}

// ─── System Prompt Builder ────────────────────────────────────────────────────

function buildSystemPrompt(context: AIContext): string {
  const lines: string[] = [
    'You are the WorkNest AI assistant — an intelligent, role-aware, read-only workplace assistant built into the WorkNest workforce and project management platform.',
    '',
    `Authenticated User: ${context.userName || 'User'} | Role: ${context.userRole}` +
      (context.companyName ? ` | Company: ${context.companyName}` : ' | Platform-Level Scope') +
      (context.userDepartment ? ` | Department: ${context.userDepartment}` : ''),
  ];

  if (context.platformSummary) {
    lines.push(
      '',
      'Platform Governance Overview (Super Admin Access):',
      `- Total Companies Registered: ${context.platformSummary.totalCompanies}`,
      `- Total Active Users Platform-Wide: ${context.platformSummary.totalUsers}`,
      `- Tenant Summaries: ${context.platformSummary.companies
        .map((c) => `${c.name} (${c.plan} plan, ${c.userCount} users, ${c.projectCount} projects)`)
        .join('; ')}`
    );
  }

  if (context.teamSize !== undefined) {
    lines.push(`Total active company team members: ${context.teamSize}.`);
  }

  if (context.departmentCounts && Object.keys(context.departmentCounts).length > 0) {
    const deptStr = Object.entries(context.departmentCounts)
      .map(([d, c]) => `${d}: ${c}`)
      .join(', ');
    lines.push(`Department distribution: ${deptStr}.`);
  }

  // Assigned Tasks section (Task Prioritization)
  if (context.userTasks && context.userTasks.length > 0) {
    lines.push('', 'Assigned Active Tasks for this User (ordered by due date & priority):');
    for (const t of context.userTasks) {
      const overdueTag = t.isOverdue ? ' [OVERDUE]' : '';
      lines.push(
        `  * "${t.title}" | Project: ${t.projectName} | Priority: ${t.priority} | Status: ${t.status} | Due: ${t.dueDate || 'No deadline'}${overdueTag}`
      );
    }
  } else if (context.companyName) {
    lines.push('', 'Assigned Tasks: No pending tasks are currently assigned to you.');
  }

  // Projects Overview section (Project Analysis)
  if (context.projectSummaries && context.projectSummaries.length > 0) {
    lines.push('', 'Company Projects Health & Status:');
    for (const p of context.projectSummaries) {
      const overdueTag = p.isOverdue ? ' [BEHIND SCHEDULE / OVERDUE]' : '';
      lines.push(
        `  * ${p.name} | Status: ${p.status} | Progress: ${p.progress}% | Due: ${p.dueDate || 'No deadline'}${overdueTag} | Manager: ${p.managerName || 'Unassigned'} | Tasks: ${p.completedTasks}/${p.taskCount} completed (${p.overdueTasks} overdue)`
      );
    }
  } else if (context.companyName) {
    lines.push('', 'Company Projects: No projects recorded for this company.');
  }

  lines.push(
    '',
    'Core Behavioral Instructions:',
    '1. STRICT TRUTH & READ-ONLY: Base all answers exclusively on the WorkNest data supplied above. You are strictly a read-only assistant; you cannot create, modify, or delete tasks/projects/users, execute SQL, or change roles/permissions.',
    '2. HALLUCINATION RESISTANCE: If the user asks about a project, person, task, or company that is NOT in your context above (for example "Mars Colony Project"), explicitly state that no such project or record exists in your WorkNest data. NEVER invent names, deadlines, tasks, or metrics.',
    '3. TASK PRIORITIZATION: When asked what to prioritize or work on, analyze the user\'s assigned tasks above. Prioritize High priority and overdue tasks first, followed by approaching due dates, and explain the rationale clearly.',
    '4. PROJECT ANALYSIS: When asked which projects are behind schedule or need attention, evaluate progress percentage, overdue flags, and overdue task counts from the projects list above.',
    '5. ROLE AWARENESS: Tailor the tone and recommendations to the user\'s role (e.g., strategic summary for Company Owner, delivery & blockers for Manager, workforce & onboarding for HR, task execution for Employee, platform oversight for Super Admin).',
    '6. CONCISE & ACTIONABLE: Use bullet points, bold text for key terms, and keep answers actionable, professional, and concise.'
  );

  return lines.join('\n');
}

// ─── NVIDIA API Call ──────────────────────────────────────────────────────────

interface NvidiaChoice {
  message: { role: string; content: string };
  finish_reason: string;
}

interface NvidiaResponseBody {
  id: string;
  model: string;
  choices: NvidiaChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

async function callNvidiaApi(systemPrompt: string, userMessage: string): Promise<NvidiaResponseBody> {
  if (!env.NVIDIA_API_KEY) {
    throw new AppError('NVIDIA AI is not configured on this server. Please set NVIDIA_API_KEY.', 503);
  }

  let response: Response;
  try {
    response = await fetch(env.NVIDIA_API_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.NVIDIA_AI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 512,
        temperature: 0.7,
        stream: false,
      }),
      // 60-second hard timeout for remote LLM inference
      signal: AbortSignal.timeout(60_000),
    });
  } catch (err: any) {
    console.error('[AI] Fetch network error:', err);
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new AppError('AI request timed out. Please try again.', 504);
    }
    throw new AppError(`Failed to reach the AI service: ${err.message || 'Network error'}`, 502);
  }

  if (response.status === 401) {
    // Key present but invalid — never echo the key in the error
    throw new AppError('AI service authentication failed. Contact your administrator.', 502);
  }

  if (response.status === 429) {
    throw new AppError('AI service rate limit reached. Please wait a moment and try again.', 429);
  }

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = (await response.json()) as any;
      errorDetail = errJson.detail || errJson.message || errJson.title || '';
    } catch {
      // ignore parsing error
    }
    console.error(`[AI] NVIDIA API Error (HTTP ${response.status}):`, errorDetail);
    throw new AppError(
      errorDetail
        ? `AI service error: ${errorDetail}`
        : `AI service returned an error (HTTP ${response.status}). Please try again.`,
      502
    );
  }

  let body: NvidiaResponseBody;
  try {
    body = (await response.json()) as NvidiaResponseBody;
  } catch {
    throw new AppError('AI service returned a malformed response.', 502);
  }

  if (!body.choices || body.choices.length === 0) {
    throw new AppError('AI service returned an empty response.', 502);
  }

  return body;
}

// ─── Public Service Interface ─────────────────────────────────────────────────

export class AIService {
  /**
   * Send a user message to NVIDIA AI with role-aware, tenant-isolated context.
   *
   * @param message  - The user's message (already validated: non-empty, ≤4000 chars)
   * @param user     - Authenticated token payload (source of truth for role/companyId)
   */
  static async chat(message: string, user: TokenPayload): Promise<AIResponse> {
    console.log(`[AI] Request started | userId=${user.userId} | role=${user.role}`);

    const context = await buildContext(user);
    const systemPrompt = buildSystemPrompt(context);

    let nvidiaResponse: NvidiaResponseBody;
    try {
      nvidiaResponse = await callNvidiaApi(systemPrompt, message);
    } catch (err) {
      console.error(`[AI] Request failed | userId=${user.userId} | error=${(err as Error).message}`);
      throw err;
    }

    const reply = nvidiaResponse.choices[0].message.content.trim();
    console.log(`[AI] Request completed | userId=${user.userId} | model=${nvidiaResponse.model}`);

    return {
      reply,
      model: nvidiaResponse.model,
      usage: nvidiaResponse.usage,
    };
  }
}
