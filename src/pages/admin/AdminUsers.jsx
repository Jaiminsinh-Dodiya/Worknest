import { useState, useMemo } from 'react';
import { UserX, UserCheck, Eye, Edit } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import SearchBar from '../../components/ui/SearchBar';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Dropdown from '../../components/ui/Dropdown';
import { ROLE_LABELS, ROLES } from '../../config/roles';

export default function AdminUsers() {
  const { users, currentUser, companies, deactivateUser } = useApp();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [companyFilter, setCompanyFilter] = useState('All');

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;
      const matchesCompany =
        companyFilter === 'All' ||
        (companyFilter === 'null' && !user.companyId) ||
        user.companyId === companyFilter;

      return matchesSearch && matchesRole && matchesCompany;
    });
  }, [users, search, roleFilter, companyFilter]);

  const handleToggleStatus = (user) => {
    deactivateUser(user.id);
    addToast(
      `${user.name} has been ${user.status === 'Active' ? 'deactivated' : 'activated'}.`,
      'success'
    );
  };

  const getCompanyName = (companyId) => {
    if (!companyId) return 'WorkNest Platform';
    const comp = companies.find((c) => c.id === companyId);
    return comp ? comp.name : 'Unknown';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Users"
        subtitle="Manage all user accounts across all tenant organizations."
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search all platform users..."
          className="sm:w-72"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
        >
          <option value="All">All Roles</option>
          {Object.values(ROLES).map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
          ))}
        </select>
        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
        >
          <option value="All">All Tenants</option>
          <option value="null">Platform Level</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size="md" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user.name}
                          {user.id === currentUser.id && (
                            <span className="text-xs text-primary-600 dark:text-primary-400 ml-1.5 font-normal">(You)</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {getCompanyName(user.companyId)}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">{user.department}</td>
                  <td className="px-5 py-3">
                    <Badge>{user.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {user.id !== currentUser.id && (
                      <Dropdown
                        items={[
                          { label: 'View Profile', icon: Eye, onClick: () => {} },
                          { label: 'Edit Account', icon: Edit, onClick: () => {} },
                          {
                            label: user.status === 'Active' ? 'Deactivate' : 'Activate',
                            icon: user.status === 'Active' ? UserX : UserCheck,
                            onClick: () => handleToggleStatus(user),
                            danger: user.status === 'Active',
                          },
                        ]}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-sm text-gray-500 dark:text-gray-400">
              No platform users match your filters.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
