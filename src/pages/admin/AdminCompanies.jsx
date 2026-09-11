import { useState, useMemo } from 'react';
import { Building2, Plus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';

export default function AdminCompanies() {
  const { companies, users, projects } = useApp();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('All');

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.industry.toLowerCase().includes(search.toLowerCase());
      const matchesPlan = planFilter === 'All' || c.plan === planFilter;
      return matchesSearch && matchesPlan;
    });
  }, [companies, search, planFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenant Management"
        subtitle="Manage and oversee all registered organization workspaces across WorkNest."
        actions={
          <Button icon={Plus} onClick={() => addToast('New company onboarding wizard opened.', 'info')}>
            Onboard Tenant
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search tenants..."
          className="sm:w-72"
        />
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
        >
          <option value="All">All Plans</option>
          <option value="Starter">Starter</option>
          <option value="Professional">Professional</option>
          <option value="Enterprise">Enterprise</option>
        </select>
      </div>

      {/* Companies Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Industry</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Team Size</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan Tier</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Onboarded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {filteredCompanies.map((company) => {
                const companyUsers = users.filter((u) => u.companyId === company.id);
                const companyProjects = projects.filter((p) => p.companyId === company.id);

                return (
                  <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-lg">
                          <Building2 size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{company.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {companyUsers.length} users • {companyProjects.length} projects
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {company.industry}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {company.size} employees
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="info">{company.plan}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge>{company.status}</Badge>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(company.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
