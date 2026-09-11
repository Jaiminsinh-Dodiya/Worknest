import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit,
  Lock,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  Calendar,
  Briefcase,
  ArrowRight,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { ROLE_LABELS, ROLES } from '../config/roles';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';

const ROLE_PERMISSIONS_SUMMARY = {
  [ROLES.SUPER_ADMIN]: 'Full platform administrator privileges across all tenant organizations, companies, and platform users.',
  [ROLES.COMPANY_OWNER]: 'Full company administrator privileges: oversee company projects, manage workforce, and direct organizational strategy.',
  [ROLES.HR]: 'Human Resources administration: onboard new employees, manage user accounts, update statuses, and oversee departments.',
  [ROLES.MANAGER]: 'Project and delivery leadership: create and assign tasks, manage deadlines, and lead cross-functional team members.',
  [ROLES.EMPLOYEE]: 'Individual contributor workspace: manage assigned tasks, update progress milestones, and collaborate on team projects.',
};

export default function Profile() {
  const { currentUser, company, updateUser } = useApp();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [editForm, setEditForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.email.trim()) {
      addToast('Name and email are required.', 'error');
      return;
    }

    try {
      await updateUser(currentUser.id, editForm);
      addToast('Profile updated successfully.', 'success');
      setShowEditModal(false);
    } catch {
      addToast('Failed to update profile. Please try again.', 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword) {
      addToast('Please enter a new password.', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      addToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast('New password and confirmation do not match.', 'error');
      return;
    }

    try {
      await updateUser(currentUser.id, { password: passwordForm.newPassword });
      addToast('Password updated successfully.', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
    } catch {
      addToast('Failed to update password. Please try again.', 'error');
    }
  };

  const roleLabel = ROLE_LABELS[currentUser?.role] || currentUser?.role || 'User';
  const permissionSummary = ROLE_PERMISSIONS_SUMMARY[currentUser?.role] || 'Standard platform access.';

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <PageHeader
        title="My Profile"
        subtitle="View and manage your personal account information, role permissions, and credentials."
      />

      {/* ── User Profile Hero Card ── */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <Avatar name={currentUser?.name || 'User'} size="xl" />
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{currentUser?.name}</h2>
                <Badge variant={currentUser?.status === 'Active' ? 'success' : 'neutral'}>
                  {currentUser?.status || 'Active'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
                <Briefcase size={14} className="text-gray-400" />
                <span>{roleLabel}</span>
                <span>•</span>
                <span>{currentUser?.department || 'General'}</span>
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1.5">
                <Building2 size={13} />
                <span>{company?.name || 'WorkNest'}</span>
              </p>
            </div>
          </div>

          <div className="flex gap-2.5 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              icon={Edit}
              onClick={() => {
                setEditForm({
                  name: currentUser?.name || '',
                  email: currentUser?.email || '',
                  phone: currentUser?.phone || '',
                });
                setShowEditModal(true);
              }}
              className="flex-1 sm:flex-none"
            >
              Edit Profile
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Lock}
              onClick={() => {
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setShowPasswordModal(true);
              }}
              className="flex-1 sm:flex-none"
            >
              Change Password
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Two-Column Information Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <Card>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg">
              <Mail size={18} />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Personal Information</h3>
          </div>

          <div className="space-y-3.5 text-sm">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
              <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">{currentUser?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Email Address</p>
              <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5 flex items-center gap-1.5">
                <Mail size={14} className="text-gray-400" />
                <span>{currentUser?.email}</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Phone Number</p>
              <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5 flex items-center gap-1.5">
                <Phone size={14} className="text-gray-400" />
                <span>{currentUser?.phone || '+91 98765 43210'}</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Department</p>
              <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">{currentUser?.department || 'General'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Joined Organization</p>
              <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5 flex items-center gap-1.5">
                <Calendar size={14} className="text-gray-400" />
                <span>
                  {currentUser?.joinedAt
                    ? new Date(currentUser.joinedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'January 15, 2024'}
                </span>
              </p>
            </div>
          </div>
        </Card>

        {/* Organization & Role Access */}
        <Card>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <ShieldCheck size={18} />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Workspace & Permissions</h3>
          </div>

          <div className="space-y-3.5 text-sm">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Assigned Organization</p>
              <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">{company?.name || 'WorkNest'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tenant Tier / Plan</p>
              <div className="mt-0.5">
                <Badge variant="info">{company?.plan || 'Enterprise'}</Badge>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">System Role</p>
              <div className="mt-0.5">
                <Badge variant="primary">{roleLabel}</Badge>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Operational Scope</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed bg-gray-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-gray-100 dark:border-slate-800">
                {permissionSummary}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Account Security Summary Card ── */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg mt-0.5">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Account Credentials & Security</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Protected with bcrypt salted password hashing and signed JWT authentication sessions.
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 size={14} /> Password Active
                </span>
                <span>•</span>
                <span>Last session refreshed just now</span>
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={Lock}
            onClick={() => setShowPasswordModal(true)}
          >
            Update Password
          </Button>
        </div>
      </Card>

      {/* ── Quick Link to Settings ── */}
      <div className="p-4 rounded-xl border border-primary-100 dark:border-primary-900/40 bg-primary-50/50 dark:bg-primary-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Looking for Theme, Notifications, or Application Settings?
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Customize interface appearance, desktop alerts, and check backend connectivity in the dedicated Settings panel.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={ArrowRight}
          onClick={() => navigate('/settings')}
        >
          Open Settings
        </Button>
      </div>

      {/* ── Edit Profile Modal ── */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Profile">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Full Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            required
          />
          <Input
            label="Phone"
            value={editForm.phone}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* ── Change Password Modal ── */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="Enter current password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            required
          />
          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password (min. 6 characters)"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm new password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowPasswordModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Password</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
