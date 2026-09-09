/**
 * WorkNest — Mock Companies Database
 *
 * Multi-tenant company data for SaaS demonstration.
 * SUPER_ADMIN can view all companies.
 * Company-level users only see their own company.
 */

export const mockCompanies = [
  {
    id: 'company-1',
    name: 'WorkNest Technologies',
    industry: 'Software Development',
    size: '10-50',
    plan: 'Professional',
    status: 'Active',
    createdAt: '2024-01-15',
  },
  {
    id: 'company-2',
    name: 'TechNova Solutions',
    industry: 'IT Consulting',
    size: '1-10',
    plan: 'Starter',
    status: 'Active',
    createdAt: '2024-06-01',
  },
  {
    id: 'company-3',
    name: 'CloudSync Labs',
    industry: 'Cloud Infrastructure',
    size: '50-200',
    plan: 'Enterprise',
    status: 'Active',
    createdAt: '2024-03-10',
  },
];

/** Helper: get a company by ID */
export function getCompanyById(id) {
  return mockCompanies.find((c) => c.id === id) || null;
}

/** Keep backward-compatible export for existing references */
export const currentCompany = mockCompanies[0];
