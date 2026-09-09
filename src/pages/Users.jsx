import { useState, useMemo } from 'react';
import { Plus, Eye, Edit, UserX, UserCheck } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { ROLES, ROLE_LABELS } from '../config/roles';
import { hasPermission } from '../config/permissions';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import SearchBar from '../components/ui/SearchBar';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Dropdown from '../components/ui/Dropdown';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

export default function Users() {
  const { allUsers, currentUser, addUser, deactivateUser, company } = useApp();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Development',
    role: ROLES.EMPLOYEE,
  });

  const canManage = hasPermission(currentUser?.role, 'users.manage');

  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [allUsers, search, roleFilter]);

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    addUser(newUser);
    addToast('User added successfully.', 'success');
    setShowAddModal(false);
    setNewUser({ name: '', email: '', phone: '', department: 'Development', role: ROLES.EMPLOYEE });
  };

  const handleToggleStatus = (user) => {
    deactivateUser(user.id);
    addToast(
      `${user.name} has been ${user.status === 'Active' ? 'deactivated' : 'activated'}.`,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle={`Manage employees and roles for ${company.name}.`}
        actions={
          canManage ? (
            <Button icon={Plus} onClick={() => setShowAddModal(true)}>
              Add User
            </Button>
          ) : null
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search users..."
          className="sm:w-72"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
        >
          <option value="All">All Roles</option>
          <option value={ROLES.COMPANY_OWNER}>{ROLE_LABELS[ROLES.COMPANY_OWNER]}</option>
          <option value={ROLES.HR}>{ROLE_LABELS[ROLES.HR]}</option>
          <option value={ROLES.MANAGER}>{ROLE_LABELS[ROLES.MANAGER]}</option>
          <option value={ROLES.EMPLOYEE}>{ROLE_LABELS[ROLES.EMPLOYEE]}</option>
        </select>
      </div>

      {/* Users Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                {canManage && (
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                )}
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
                          {user.id === currentUser?.id && (
                            <span className="text-xs text-primary-600 dark:text-primary-400 ml-1.5 font-normal">(You)</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
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
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  {canManage && (
                    <td className="px-5 py-3 text-right">
                      {user.id !== currentUser?.id && (
                        <Dropdown
                          items={[
                            { label: 'View', icon: Eye, onClick: () => {} },
                            { label: 'Edit', icon: Edit, onClick: () => {} },
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
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No users found matching your criteria.
            </div>
          )}
        </div>
      </Card>

      {/* Add User Modal */}
      {canManage && (
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New User">
          <form onSubmit={handleAddUser} className="space-y-4">
            <Input
              label="Full Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="Enter full name"
              required
            />
            <Input
              label="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="Enter email address"
              required
            />
            <Input
              label="Phone"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              placeholder="Enter phone number"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Department</label>
              <select
                value={newUser.department}
                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              >
                <option>Development</option>
                <option>Design</option>
                <option>Human Resources</option>
                <option>Quality Assurance</option>
                <option>Management</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              >
                <option value={ROLES.EMPLOYEE}>{ROLE_LABELS[ROLES.EMPLOYEE]}</option>
                <option value={ROLES.MANAGER}>{ROLE_LABELS[ROLES.MANAGER]}</option>
                <option value={ROLES.HR}>{ROLE_LABELS[ROLES.HR]}</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Add User
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
