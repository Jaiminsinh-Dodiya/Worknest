import { useState, useMemo } from 'react';
import {
  Plus,
  Eye,
  Edit,
  UserX,
  UserCheck,
  Trash2,
  AlertTriangle,
  Phone,
  Building,
  Calendar,
  Briefcase,
} from 'lucide-react';
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
  const { allUsers, currentUser, addUser, updateUser, deactivateUser, deleteUser, company } = useApp();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: 'Development',
    role: ROLES.EMPLOYEE,
  });

  // Edit User Form State
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Development',
    role: ROLES.EMPLOYEE,
  });

  const canManage = hasPermission(currentUser?.role, 'users.manage');

  // Available departments list
  const departments = useMemo(() => {
    const set = new Set(allUsers.map((u) => u.department).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [allUsers]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        (user.phone && user.phone.includes(search));
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;
      const matchesDept = departmentFilter === 'All' || user.department === departmentFilter;
      return matchesSearch && matchesRole && matchesDept;
    });
  }, [allUsers, search, roleFilter, departmentFilter]);

  // Open Edit Modal
  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      department: user.department || 'Development',
      role: user.role || ROLES.EMPLOYEE,
    });
  };

  // Submit Add User
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    setIsSubmitting(true);
    try {
      await addUser(newUser);
      addToast(`Employee "${newUser.name}" added successfully.`, 'success');
      setShowAddModal(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        phone: '',
        department: 'Development',
        role: ROLES.EMPLOYEE,
      });
    } catch (err) {
      addToast(err.message || 'Failed to add user.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit User
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      await updateUser(editingUser.id, editForm);
      addToast(`Profile for "${editForm.name}" updated successfully.`, 'success');
      setEditingUser(null);
    } catch (err) {
      addToast(err.message || 'Failed to update user profile.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active/Inactive Status
  const handleToggleStatus = async (user) => {
    try {
      await deactivateUser(user.id);
      addToast(
        `${user.name} has been ${user.status === 'Active' ? 'deactivated' : 'activated'}.`,
        'success'
      );
    } catch (err) {
      addToast(err.message || 'Failed to update status.', 'error');
    }
  };

  // Confirm Delete User
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setIsSubmitting(true);
    try {
      await deleteUser(deletingUser.id);
      addToast(`Employee "${deletingUser.name}" deleted successfully.`, 'success');
      setDeletingUser(null);
    } catch (err) {
      addToast(err.message || 'Failed to delete user.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & Employees"
        subtitle={`Manage workforce profiles, roles, and access credentials for ${company.name}.`}
        actions={
          canManage ? (
            <Button icon={Plus} onClick={() => setShowAddModal(true)}>
              Add Employee
            </Button>
          ) : null
        }
      />

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email, or phone..."
          className="sm:w-80"
        />

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3.5 py-2 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
        >
          <option value="All">All Roles</option>
          <option value={ROLES.COMPANY_OWNER}>{ROLE_LABELS[ROLES.COMPANY_OWNER]}</option>
          <option value={ROLES.HR}>{ROLE_LABELS[ROLES.HR]}</option>
          <option value={ROLES.MANAGER}>{ROLE_LABELS[ROLES.MANAGER]}</option>
          <option value={ROLES.EMPLOYEE}>{ROLE_LABELS[ROLES.EMPLOYEE]}</option>
        </select>

        {/* Department Filter */}
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="px-3.5 py-2 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept === 'All' ? 'All Departments' : dept}
            </option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {filteredUsers.map((user) => {
                const isSelf = user.id === currentUser?.id;
                const isOwner = user.role === ROLES.COMPANY_OWNER;
                const isSuperAdmin = user.role === ROLES.SUPER_ADMIN;

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors group"
                  >
                    {/* User Info */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} size="md" />
                        <div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setViewingUser(user)}
                              className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 text-left transition-colors cursor-pointer"
                            >
                              {user.name}
                            </button>
                            {isSelf && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400">
                      {user.department || '—'}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <Badge variant={user.status === 'Active' ? 'success' : 'default'}>
                        {user.status}
                      </Badge>
                    </td>

                    {/* Joined Date */}
                    <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">
                      {user.joinedAt
                        ? new Date(user.joinedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick View Button */}
                        <button
                          type="button"
                          onClick={() => setViewingUser(user)}
                          title="View Profile Details"
                          className="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <Eye size={16} />
                        </button>

                        {/* Quick Edit Button (if authorized) */}
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            title="Edit Employee"
                            className="p-1.5 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          >
                            <Edit size={16} />
                          </button>
                        )}

                        {/* Context Dropdown with Full Actions */}
                        {canManage && !isSelf && (
                          <Dropdown
                            items={[
                              {
                                label: 'View Details',
                                icon: Eye,
                                onClick: () => setViewingUser(user),
                              },
                              {
                                label: 'Edit Profile',
                                icon: Edit,
                                onClick: () => handleOpenEdit(user),
                              },
                              {
                                label: user.status === 'Active' ? 'Deactivate Employee' : 'Activate Employee',
                                icon: user.status === 'Active' ? UserX : UserCheck,
                                onClick: () => handleToggleStatus(user),
                                danger: user.status === 'Active',
                              },
                              ...(!isOwner && !isSuperAdmin
                                ? [
                                    {
                                      label: 'Delete Employee',
                                      icon: Trash2,
                                      onClick: () => setDeletingUser(user),
                                      danger: true,
                                    },
                                  ]
                                : []),
                            ]}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3 text-gray-400">
                <UserX size={24} />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-200">No employees found</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </Card>

      {/* ── 1. VIEW USER MODAL ── */}
      {viewingUser && (
        <Modal
          isOpen={!!viewingUser}
          onClose={() => setViewingUser(null)}
          title="Employee Profile"
        >
          <div className="space-y-6">
            {/* Header Profile Summary */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <Avatar name={viewingUser.name} size="lg" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{viewingUser.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{viewingUser.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
                    {ROLE_LABELS[viewingUser.role] || viewingUser.role}
                  </span>
                  <Badge variant={viewingUser.status === 'Active' ? 'success' : 'default'}>
                    {viewingUser.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Detailed Properties Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <Briefcase size={14} />
                  <span className="text-xs uppercase tracking-wider font-semibold">Department</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{viewingUser.department || 'Not Assigned'}</p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <Phone size={14} />
                  <span className="text-xs uppercase tracking-wider font-semibold">Phone</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{viewingUser.phone || 'No phone registered'}</p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <Building size={14} />
                  <span className="text-xs uppercase tracking-wider font-semibold">Organization</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{company.name}</p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <Calendar size={14} />
                  <span className="text-xs uppercase tracking-wider font-semibold">Joined Date</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {viewingUser.joinedAt
                    ? new Date(viewingUser.joinedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setViewingUser(null)}>
                Close
              </Button>
              {canManage && (
                <Button
                  icon={Edit}
                  onClick={() => {
                    const user = viewingUser;
                    setViewingUser(null);
                    handleOpenEdit(user);
                  }}
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ── 2. EDIT USER MODAL ── */}
      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title={`Edit Employee: ${editingUser.name}`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <Input
              label="Full Name"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              placeholder="Enter full name"
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              placeholder="Enter email address"
              required
            />
            <Input
              label="Phone Number"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Department
              </label>
              <select
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Role & Permissions
              </label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              >
                <option value={ROLES.EMPLOYEE}>{ROLE_LABELS[ROLES.EMPLOYEE]}</option>
                <option value={ROLES.MANAGER}>{ROLE_LABELS[ROLES.MANAGER]}</option>
                <option value={ROLES.HR}>{ROLE_LABELS[ROLES.HR]}</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <Button variant="secondary" type="button" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── 3. DELETE CONFIRMATION MODAL ── */}
      {deletingUser && (
        <Modal
          isOpen={!!deletingUser}
          onClose={() => setDeletingUser(null)}
          title="Delete Employee Account"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
              <AlertTriangle size={24} className="flex-shrink-0" />
              <p className="text-sm">
                Warning: This action is permanent and will delete the employee profile from the database.
              </p>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-gray-900 dark:text-gray-100">{deletingUser.name}</span> (
              {deletingUser.email})?
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Any tasks assigned to this employee will also be unlinked.
            </p>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="secondary" onClick={() => setDeletingUser(null)}>
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={16} />
                {isSubmitting ? 'Deleting...' : 'Delete Employee'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── 4. ADD USER MODAL ── */}
      {canManage && (
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Employee">
          <form onSubmit={handleAddUser} className="space-y-4">
            <Input
              label="Full Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="e.g. Dipakbhai Dodiya"
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="name@company.com"
              required
            />
            <Input
              label="Phone Number"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
            <Input
              label="Password (Optional)"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="Default: worknest123"
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Employee'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
