import { PrismaClient, Role, ProjectStatus, TaskPriority, TaskStatus, UserStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting WorkNest database seed...');

  // Clear existing records in reverse dependency order
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  console.log('  Cleaned existing database records.');

  // 1. Seed Companies
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        id: 'company-1',
        name: 'WorkNest Technologies',
        industry: 'Software Development',
        size: '10-50',
        plan: 'Professional',
        status: UserStatus.Active,
        createdAt: new Date('2024-01-15'),
      },
    }),
    prisma.company.create({
      data: {
        id: 'company-2',
        name: 'TechNova Solutions',
        industry: 'IT Consulting',
        size: '1-10',
        plan: 'Starter',
        status: UserStatus.Active,
        createdAt: new Date('2024-06-01'),
      },
    }),
    prisma.company.create({
      data: {
        id: 'company-3',
        name: 'CloudSync Labs',
        industry: 'Cloud Infrastructure',
        size: '50-200',
        plan: 'Enterprise',
        status: UserStatus.Active,
        createdAt: new Date('2024-03-10'),
      },
    }),
  ]);
  console.log(`  Created ${companies.length} companies.`);

  // 2. Seed Users (with hashed passwords)
  const passwordSaltRounds = 10;

  const usersData = [
    // Super Admin
    {
      id: 'super-admin-1',
      name: 'Super Admin',
      email: 'admin@worknest.local',
      password: 'admin123',
      phone: '+91 90000 00000',
      role: Role.SUPER_ADMIN,
      department: 'Platform',
      companyId: null,
      status: UserStatus.Active,
      joinedAt: new Date('2024-01-01'),
    },
    // Company 1
    {
      id: 'user-1',
      name: 'Jaimin Dodiya',
      email: 'owner@worknest.local',
      password: 'owner123',
      phone: '+91 98765 43210',
      role: Role.COMPANY_OWNER,
      department: 'Management',
      companyId: 'company-1',
      status: UserStatus.Active,
      joinedAt: new Date('2024-01-15'),
    },
    {
      id: 'user-2',
      name: 'Priya Shah',
      email: 'hr@worknest.local',
      password: 'hr123',
      phone: '+91 98765 43211',
      role: Role.HR,
      department: 'Human Resources',
      companyId: 'company-1',
      status: UserStatus.Active,
      joinedAt: new Date('2024-02-10'),
    },
    {
      id: 'user-3',
      name: 'Rahul Kumar',
      email: 'manager@worknest.local',
      password: 'manager123',
      phone: '+91 98765 43212',
      role: Role.MANAGER,
      department: 'Development',
      companyId: 'company-1',
      status: UserStatus.Active,
      joinedAt: new Date('2024-02-15'),
    },
    {
      id: 'user-4',
      name: 'Anita Mehta',
      email: 'anita@worknest.local',
      password: 'anita123',
      phone: '+91 98765 43213',
      role: Role.MANAGER,
      department: 'Design',
      companyId: 'company-1',
      status: UserStatus.Active,
      joinedAt: new Date('2024-03-01'),
    },
    {
      id: 'user-5',
      name: 'Vikram Patel',
      email: 'employee@worknest.local',
      password: 'employee123',
      phone: '+91 98765 43214',
      role: Role.EMPLOYEE,
      department: 'Development',
      companyId: 'company-1',
      status: UserStatus.Active,
      joinedAt: new Date('2024-03-10'),
    },
    {
      id: 'user-6',
      name: 'Sneha Reddy',
      email: 'sneha@worknest.local',
      password: 'sneha123',
      phone: '+91 98765 43215',
      role: Role.EMPLOYEE,
      department: 'Development',
      companyId: 'company-1',
      status: UserStatus.Active,
      joinedAt: new Date('2024-04-01'),
    },
    {
      id: 'user-7',
      name: 'Amit Sharma',
      email: 'amit@worknest.local',
      password: 'amit123',
      phone: '+91 98765 43216',
      role: Role.EMPLOYEE,
      department: 'Design',
      companyId: 'company-1',
      status: UserStatus.Active,
      joinedAt: new Date('2024-04-15'),
    },
    {
      id: 'user-8',
      name: 'Deepa Nair',
      email: 'deepa@worknest.local',
      password: 'deepa123',
      phone: '+91 98765 43217',
      role: Role.EMPLOYEE,
      department: 'Quality Assurance',
      companyId: 'company-1',
      status: UserStatus.Active,
      joinedAt: new Date('2024-05-01'),
    },
    {
      id: 'user-9',
      name: 'Karan Joshi',
      email: 'karan@worknest.local',
      password: 'karan123',
      phone: '+91 98765 43218',
      role: Role.EMPLOYEE,
      department: 'Development',
      companyId: 'company-1',
      status: UserStatus.Inactive,
      joinedAt: new Date('2024-05-15'),
    },
    // Company 2
    {
      id: 'user-10',
      name: 'Ravi Desai',
      email: 'ravi@technova.local',
      password: 'ravi123',
      phone: '+91 91234 56789',
      role: Role.COMPANY_OWNER,
      department: 'Management',
      companyId: 'company-2',
      status: UserStatus.Active,
      joinedAt: new Date('2024-06-01'),
    },
    {
      id: 'user-11',
      name: 'Meera Kapoor',
      email: 'meera@technova.local',
      password: 'meera123',
      phone: '+91 91234 56790',
      role: Role.EMPLOYEE,
      department: 'Development',
      companyId: 'company-2',
      status: UserStatus.Active,
      joinedAt: new Date('2024-06-15'),
    },
  ];

  for (const u of usersData) {
    const hashedPassword = await bcrypt.hash(u.password, passwordSaltRounds);
    await prisma.user.create({
      data: {
        id: u.id,
        name: u.name,
        email: u.email,
        password: hashedPassword,
        phone: u.phone,
        role: u.role,
        department: u.department,
        companyId: u.companyId,
        status: u.status,
        joinedAt: u.joinedAt,
      },
    });
  }
  console.log(`  Created ${usersData.length} users.`);

  // 3. Seed Projects
  const projectsData = [
    {
      id: 'proj-1',
      name: 'Website Redesign',
      description: "Redesign the company's public website with modern UI/UX, improved performance, and mobile responsiveness.",
      managerId: 'user-3',
      companyId: 'company-1',
      teamMemberIds: ['user-1', 'user-3', 'user-5', 'user-7'],
      progress: 78,
      status: ProjectStatus.Active,
      startDate: new Date('2024-06-01'),
      dueDate: new Date('2024-08-30'),
      createdAt: new Date('2024-05-20'),
    },
    {
      id: 'proj-2',
      name: 'Mobile Application',
      description: 'Build a cross-platform mobile app for clients to access project dashboards and task updates on the go.',
      managerId: 'user-4',
      companyId: 'company-1',
      teamMemberIds: ['user-4', 'user-6', 'user-5'],
      progress: 45,
      status: ProjectStatus.Active,
      startDate: new Date('2024-07-01'),
      dueDate: new Date('2024-10-15'),
      createdAt: new Date('2024-06-25'),
    },
    {
      id: 'proj-3',
      name: 'Inventory Management System',
      description: 'Develop an internal inventory tracking system for managing office supplies, equipment, and asset allocation.',
      managerId: 'user-3',
      companyId: 'company-1',
      teamMemberIds: ['user-3', 'user-8', 'user-6'],
      progress: 92,
      status: ProjectStatus.Active,
      startDate: new Date('2024-04-15'),
      dueDate: new Date('2024-08-20'),
      createdAt: new Date('2024-04-10'),
    },
    {
      id: 'proj-4',
      name: 'Employee Onboarding Portal',
      description: 'Create a self-service onboarding portal for new employees to complete documentation and training modules.',
      managerId: 'user-4',
      companyId: 'company-1',
      teamMemberIds: ['user-2', 'user-4', 'user-7'],
      progress: 100,
      status: ProjectStatus.Completed,
      startDate: new Date('2024-02-01'),
      dueDate: new Date('2024-05-30'),
      createdAt: new Date('2024-01-25'),
    },
    {
      id: 'proj-5',
      name: 'API Integration Platform',
      description: 'Build a centralized platform for managing third-party API integrations, webhooks, and data synchronization.',
      managerId: 'user-3',
      companyId: 'company-1',
      teamMemberIds: ['user-3', 'user-5', 'user-9'],
      progress: 15,
      status: ProjectStatus.OnHold,
      startDate: new Date('2024-08-01'),
      dueDate: new Date('2024-12-31'),
      createdAt: new Date('2024-07-20'),
    },
  ];

  for (const p of projectsData) {
    const { teamMemberIds, ...projectFields } = p;
    await prisma.project.create({
      data: {
        ...projectFields,
        teamMembers: {
          connect: teamMemberIds.map((id) => ({ id })),
        },
      },
    });
  }
  console.log(`  Created ${projectsData.length} projects.`);

  // 4. Seed Tasks
  const tasksData = [
    {
      id: 'task-1',
      title: 'Design Login Page',
      description: 'Create a modern, clean login page with email/password fields and demo credentials.',
      projectId: 'proj-1',
      assigneeId: 'user-1',
      priority: TaskPriority.High,
      status: TaskStatus.InProgress,
      dueDate: new Date('2024-08-27'),
      createdAt: new Date('2024-06-05'),
    },
    {
      id: 'task-2',
      title: 'Setup REST API',
      description: 'Configure Node.js REST API with Prisma ORM and database connection.',
      projectId: 'proj-1',
      assigneeId: 'user-5',
      priority: TaskPriority.High,
      status: TaskStatus.InProgress,
      dueDate: new Date('2024-08-25'),
      createdAt: new Date('2024-06-10'),
    },
    {
      id: 'task-3',
      title: 'Create Wireframes',
      description: 'Design wireframes for all major pages including dashboard, projects, and user management.',
      projectId: 'proj-1',
      assigneeId: 'user-7',
      priority: TaskPriority.Medium,
      status: TaskStatus.Completed,
      dueDate: new Date('2024-07-15'),
      createdAt: new Date('2024-06-01'),
    },
    {
      id: 'task-4',
      title: 'User Research',
      description: 'Conduct user interviews and surveys to understand pain points with current website.',
      projectId: 'proj-1',
      assigneeId: 'user-7',
      priority: TaskPriority.Low,
      status: TaskStatus.Completed,
      dueDate: new Date('2024-06-30'),
      createdAt: new Date('2024-06-01'),
    },
    {
      id: 'task-5',
      title: 'Dashboard Layout',
      description: 'Implement the main dashboard with stat cards, project overview, and recent activity.',
      projectId: 'proj-1',
      assigneeId: 'user-3',
      priority: TaskPriority.Medium,
      status: TaskStatus.InProgress,
      dueDate: new Date('2024-08-28'),
      createdAt: new Date('2024-07-01'),
    },
    {
      id: 'task-6',
      title: 'Database Schema Design',
      description: 'Design and document the SQL Server database schema for all entities.',
      projectId: 'proj-1',
      assigneeId: 'user-5',
      priority: TaskPriority.High,
      status: TaskStatus.Todo,
      dueDate: new Date('2024-08-30'),
      createdAt: new Date('2024-07-15'),
    },
    {
      id: 'task-7',
      title: 'Write Unit Tests',
      description: 'Write unit tests for API endpoints and business logic layer.',
      projectId: 'proj-1',
      assigneeId: 'user-8',
      priority: TaskPriority.Medium,
      status: TaskStatus.Todo,
      dueDate: new Date('2024-08-29'),
      createdAt: new Date('2024-07-20'),
    },
    {
      id: 'task-8',
      title: 'App Architecture',
      description: 'Define the mobile app architecture, navigation flow, and state management approach.',
      projectId: 'proj-2',
      assigneeId: 'user-4',
      priority: TaskPriority.High,
      status: TaskStatus.Completed,
      dueDate: new Date('2024-07-20'),
      createdAt: new Date('2024-07-05'),
    },
    {
      id: 'task-9',
      title: 'UI Component Library',
      description: 'Build a reusable UI component library for the mobile application.',
      projectId: 'proj-2',
      assigneeId: 'user-6',
      priority: TaskPriority.Medium,
      status: TaskStatus.InProgress,
      dueDate: new Date('2024-09-10'),
      createdAt: new Date('2024-07-15'),
    },
    {
      id: 'task-10',
      title: 'Push Notifications',
      description: 'Implement push notification system for task updates and project milestones.',
      projectId: 'proj-2',
      assigneeId: 'user-5',
      priority: TaskPriority.Low,
      status: TaskStatus.Todo,
      dueDate: new Date('2024-10-01'),
      createdAt: new Date('2024-07-20'),
    },
    {
      id: 'task-11',
      title: 'Inventory Dashboard',
      description: 'Build the main inventory dashboard with stock levels, alerts, and quick actions.',
      projectId: 'proj-3',
      assigneeId: 'user-6',
      priority: TaskPriority.High,
      status: TaskStatus.Completed,
      dueDate: new Date('2024-07-30'),
      createdAt: new Date('2024-04-20'),
    },
    {
      id: 'task-12',
      title: 'Barcode Scanner Integration',
      description: 'Integrate barcode scanning functionality for quick item lookup and inventory updates.',
      projectId: 'proj-3',
      assigneeId: 'user-8',
      priority: TaskPriority.Medium,
      status: TaskStatus.InProgress,
      dueDate: new Date('2024-08-15'),
      createdAt: new Date('2024-06-01'),
    },
    {
      id: 'task-13',
      title: 'Reports Module',
      description: 'Create reporting module with export to PDF and Excel for inventory audits.',
      projectId: 'proj-3',
      assigneeId: 'user-3',
      priority: TaskPriority.Low,
      status: TaskStatus.Todo,
      dueDate: new Date('2024-08-20'),
      createdAt: new Date('2024-06-15'),
    },
  ];

  for (const t of tasksData) {
    await prisma.task.create({
      data: t,
    });
  }
  console.log(`  Created ${tasksData.length} tasks.`);

  console.log('✅ Database seeded successfully with all mock data!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
