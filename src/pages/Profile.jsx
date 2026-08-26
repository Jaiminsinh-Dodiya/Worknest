import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { Edit, Lock, Sun, Moon } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';

const roleLabels = {
  CompanyOwner: 'Company Owner',
  HR: 'HR',
  Manager: 'Manager',
  Employee: 'Employee',
};

export default function Profile() {
  const { currentUser, company, updateUser } = useApp();
  const { addToast } = useToast();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUser(currentUser.id, editForm);
    addToast('Profile updated successfully.', 'success');
    setShowEditModal(false);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    addToast('Password changed successfully.', 'success');
    setShowPasswordModal(false);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information and preferences."
      />

      {/* Profile Card */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar name={currentUser.name} size="xl" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{currentUser.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {roleLabels[currentUser.role] || currentUser.role} · {currentUser.department}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{company.name}</p>
            <div className="mt-2">
              <Badge>{currentUser.status}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={Edit} onClick={() => setShowEditModal(true)}>
              Edit Profile
            </Button>
            <Button variant="secondary" size="sm" icon={Lock} onClick={() => setShowPasswordModal(true)}>
              Change Password
            </Button>
          </div>
        </div>
      </Card>

      {/* Info Grid */}
      <Card>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Full Name</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{currentUser.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Email</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{currentUser.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Phone</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{currentUser.phone}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Department</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{currentUser.department}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Role</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{roleLabels[currentUser.role] || currentUser.role}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Joined</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {new Date(currentUser.joinedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Preferences</h3>

        {/* Theme */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Appearance</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleThemeChange('light')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-all duration-200 ${
                theme === 'light'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              <Sun size={16} />
              Light
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-all duration-200 ${
                theme === 'dark'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              <Moon size={16} />
              Dark
            </button>
          </div>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Profile">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Full Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
          />
          <Input
            label="Phone"
            value={editForm.phone}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input label="Current Password" type="password" placeholder="Enter current password" />
          <Input label="New Password" type="password" placeholder="Enter new password" />
          <Input label="Confirm Password" type="password" placeholder="Confirm new password" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
            <Button type="submit">Update Password</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
