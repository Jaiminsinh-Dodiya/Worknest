import app from '../src/index.js';
import { Server } from 'http';

interface TestResult {
  name: string;
  passed: boolean;
  details?: any;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, details?: any) {
  if (condition) {
    results.push({ name, passed: true, details });
    console.log(`  ✅ ${name}`);
  } else {
    results.push({ name, passed: false, details });
    console.error(`  ❌ ${name}`, details);
  }
}

async function runTests() {
  console.log('\n🧪 Starting WorkNest Backend API End-to-End Verification...\n');

  const server: Server = app.listen(3099);
  const baseUrl = 'http://localhost:3099';

  try {
    // 1. Health Check
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'ok', 'Health Check Endpoint (GET /api/health)');

    // 2. Authentication: Super Admin Login
    const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@worknest.local', password: 'admin123' }),
    });
    const adminLoginData = await adminLoginRes.json();
    assert(
      adminLoginRes.status === 200 &&
        adminLoginData.success === true &&
        adminLoginData.user.role === 'SUPER_ADMIN' &&
        !!adminLoginData.accessToken,
      'Super Admin Login (POST /api/auth/login)'
    );
    const adminToken = adminLoginData.accessToken;

    // 3. Authentication: Company Owner Login
    const ownerLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@worknest.local', password: 'owner123' }),
    });
    const ownerLoginData = await ownerLoginRes.json();
    assert(
      ownerLoginRes.status === 200 &&
        ownerLoginData.user.role === 'COMPANY_OWNER' &&
        ownerLoginData.user.companyId === 'company-1',
      'Company Owner Login (POST /api/auth/login)'
    );
    const ownerToken = ownerLoginData.accessToken;

    // 4. Authentication: Employee Login
    const empLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'employee@worknest.local', password: 'employee123' }),
    });
    const empLoginData = await empLoginRes.json();
    assert(
      empLoginRes.status === 200 && empLoginData.user.role === 'EMPLOYEE',
      'Employee Login (POST /api/auth/login)'
    );
    const empToken = empLoginData.accessToken;

    // 5. Inactive Account Deactivation Guard
    const inactiveLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'karan@worknest.local', password: 'karan123' }),
    });
    assert(
      inactiveLoginRes.status === 401,
      'Inactive Account Blocked with 401'
    );

    // 6. Invalid Password Guard
    const badLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@worknest.local', password: 'wrongpassword' }),
    });
    assert(badLoginRes.status === 401, 'Invalid Password Rejected with 401');

    // 7. Get Profile (GET /api/auth/me)
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    const meData = await meRes.json();
    assert(
      meRes.status === 200 && meData.user.name === 'Jaimin Dodiya',
      'Profile Retrieval (GET /api/auth/me)'
    );

    // 8. Super Admin: List All Companies
    const companiesRes = await fetch(`${baseUrl}/api/admin/companies`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const companiesData = await companiesRes.json();
    assert(
      companiesRes.status === 200 && companiesData.data.length === 3,
      'Super Admin Views All 3 Companies (GET /api/admin/companies)'
    );

    // 9. RBAC: Employee Cannot Access Admin Companies
    const forbiddenRes = await fetch(`${baseUrl}/api/admin/companies`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    assert(
      forbiddenRes.status === 403,
      'Employee Blocked from Admin Companies with 403 Forbidden'
    );

    // 10. User Scoping: Super Admin sees cross-tenant users
    const allUsersRes = await fetch(`${baseUrl}/api/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const allUsersData = await allUsersRes.json();
    assert(
      allUsersRes.status === 200 && allUsersData.data.length >= 10,
      'Super Admin Cross-Tenant User Listing (GET /api/users)'
    );

    // 11. User Scoping: Owner sees only company-1 users
    const ownerUsersRes = await fetch(`${baseUrl}/api/users`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    const ownerUsersData = await ownerUsersRes.json();
    const allCompany1 = ownerUsersData.data.every((u: any) => u.companyId === 'company-1');
    assert(
      ownerUsersRes.status === 200 && allCompany1 && ownerUsersData.data.length > 0,
      'Owner Sees Only Company-1 Users (GET /api/users)'
    );

    // 12. Projects: Owner views company projects
    const ownerProjectsRes = await fetch(`${baseUrl}/api/projects`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    const ownerProjectsData = await ownerProjectsRes.json();
    assert(
      ownerProjectsRes.status === 200 && ownerProjectsData.data.length === 5,
      'Company Owner Views Company Projects (GET /api/projects)'
    );

    // 13. Projects: Employee views only assigned projects
    const empProjectsRes = await fetch(`${baseUrl}/api/projects`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    const empProjectsData = await empProjectsRes.json();
    assert(
      empProjectsRes.status === 200 && empProjectsData.data.length < 5,
      'Employee Sees Only Assigned Projects (GET /api/projects)'
    );

    // 14. Tasks: Employee personal workspace (GET /api/tasks/my)
    const myTasksRes = await fetch(`${baseUrl}/api/tasks/my`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    const myTasksData = await myTasksRes.json();
    assert(
      myTasksRes.status === 200 && Array.isArray(myTasksData.data),
      'Employee Personal Tasks Workspace (GET /api/tasks/my)'
    );

    // Summary
    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;
    console.log(`\n📊 Verification Summary: ${passedCount}/${totalCount} tests passed.\n`);

    if (passedCount === totalCount) {
      console.log('🎉 ALL BACKEND ENDPOINTS AND SECURITY RULES VERIFIED SUCCESSFULLY!\n');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failure:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runTests();
