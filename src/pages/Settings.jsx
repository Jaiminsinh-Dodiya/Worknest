import { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  Volume2,
  Mail,
  Server,
  Database,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { ROLE_LABELS } from '../config/roles';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';

export default function Settings() {
  const { currentUser, company } = useApp();
  const { addToast } = useToast();

  // ── Appearance & Theme ──
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  const [density, setDensity] = useState(() => {
    return localStorage.getItem('worknest_density') || 'comfortable';
  });

  // ── Notification Preferences ──
  const [desktopNotifs, setDesktopNotifs] = useState(() => {
    return localStorage.getItem('worknest_notifs_desktop') !== 'false';
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('worknest_notifs_sound') === 'true';
  });
  const [emailAlerts, setEmailAlerts] = useState(() => {
    return localStorage.getItem('worknest_notifs_email') !== 'false';
  });

  // ── System & Backend State ──
  const [apiStatus, setApiStatus] = useState('checking'); // 'connected' | 'offline' | 'checking'
  const [isCheckingApi, setIsCheckingApi] = useState(false);
  const [showClearCacheModal, setShowClearCacheModal] = useState(false);

  // Check backend connectivity on mount
  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    setIsCheckingApi(true);
    try {
      const online = await api.isOnline();
      setApiStatus(online ? 'connected' : 'offline');
    } catch {
      setApiStatus('offline');
    } finally {
      setIsCheckingApi(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    localStorage.setItem('theme', newTheme);
    addToast(`Appearance set to ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode.`, 'info');
  };

  const handleDensityChange = (newDensity) => {
    setDensity(newDensity);
    localStorage.setItem('worknest_density', newDensity);
    addToast(`Display density set to ${newDensity}.`, 'info');
  };

  const handleToggle = (setter, key, label) => {
    setter((prev) => {
      const next = !prev;
      localStorage.setItem(key, String(next));
      addToast(`${label} ${next ? 'enabled' : 'disabled'}.`, 'info');
      return next;
    });
  };

  const handleClearCache = () => {
    // Preserve authentication credentials and theme
    const token = localStorage.getItem('worknest_access_token');
    const refreshToken = localStorage.getItem('worknest_refresh_token');
    const savedUser = localStorage.getItem('worknest_current_user');
    const savedTheme = localStorage.getItem('theme');

    localStorage.clear();

    if (token) localStorage.setItem('worknest_access_token', token);
    if (refreshToken) localStorage.setItem('worknest_refresh_token', refreshToken);
    if (savedUser) localStorage.setItem('worknest_current_user', savedUser);
    if (savedTheme) localStorage.setItem('theme', savedTheme);

    setShowClearCacheModal(false);
    addToast('Local application cache cleared successfully.', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <PageHeader
        title="Application Settings"
        subtitle="Manage appearance, notification preferences, system connectivity, and desktop environment."
      />

      {/* ── 1. Appearance & Theme ── */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg">
            <Sun size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Appearance & Theme</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Customize how WorkNest looks on your device.</p>
          </div>
        </div>

        <div className="space-y-5 pt-2">
          {/* Theme Selector */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2.5">
              Interface Theme
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Light Option */}
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                  theme === 'light'
                    ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500/20 shadow-sm'
                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="p-2 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-amber-500">
                  <Sun size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Light</p>
                    {theme === 'light' && <CheckCircle2 size={16} className="text-primary-600 dark:text-primary-400" />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Clean, bright workspace</p>
                </div>
              </button>

              {/* Dark Option */}
              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                  theme === 'dark'
                    ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500/20 shadow-sm'
                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-indigo-400">
                  <Moon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Dark</p>
                    {theme === 'dark' && <CheckCircle2 size={16} className="text-primary-600 dark:text-primary-400" />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Low-light contrast</p>
                </div>
              </button>

              {/* System Option */}
              <button
                type="button"
                onClick={() => handleThemeChange('system')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                  theme === 'system'
                    ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500/20 shadow-sm'
                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300">
                  <Monitor size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">System</p>
                    {theme === 'system' && <CheckCircle2 size={16} className="text-primary-600 dark:text-primary-400" />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Sync with Windows OS</p>
                </div>
              </button>
            </div>
          </div>

          {/* Density Preference */}
          <div className="border-t border-gray-100 dark:border-slate-700/60 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Interface Density</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Choose between spacious or compact table and card padding.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleDensityChange('comfortable')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  density === 'comfortable'
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700'
                    : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                Comfortable
              </button>
              <button
                type="button"
                onClick={() => handleDensityChange('compact')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  density === 'compact'
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700'
                    : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                Compact
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* ── 2. Notifications & Alerts ── */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <Bell size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Notification Preferences</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Control how and when you receive task and activity alerts.</p>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-slate-700/60">
          {/* Desktop Notifications */}
          <div className="py-3.5 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-gray-400">
                <Bell size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Desktop Popups</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Display toast notifications inside the desktop app.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle(setDesktopNotifs, 'worknest_notifs_desktop', 'Desktop notifications')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                desktopNotifs ? 'bg-primary-600' : 'bg-gray-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  desktopNotifs ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Sound Effects */}
          <div className="py-3.5 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-gray-400">
                <Volume2 size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Audio Chimes</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Play a subtle chime when tasks are completed or updated.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle(setSoundEnabled, 'worknest_notifs_sound', 'Audio chimes')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                soundEnabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Email Digest */}
          <div className="py-3.5 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-gray-400">
                <Mail size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Weekly Email Digest</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Simulate periodic email summaries of completed milestones.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle(setEmailAlerts, 'worknest_notifs_email', 'Weekly email digest')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                emailAlerts ? 'bg-primary-600' : 'bg-gray-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  emailAlerts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* ── 3. System & Connectivity ── */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <Server size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">System & Database Connectivity</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Status of the local backend server and PostgreSQL database.</p>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database size={17} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Backend REST API</span>
                <span className="text-xs text-gray-400 font-mono">http://localhost:3001/api</span>
              </div>
              <div className="flex items-center gap-2">
                {apiStatus === 'connected' ? (
                  <Badge variant="success" className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online (PostgreSQL 17)
                  </Badge>
                ) : apiStatus === 'offline' ? (
                  <Badge variant="warning" className="flex items-center gap-1.5">
                    <XCircle size={12} />
                    Offline (Mock Fallback)
                  </Badge>
                ) : (
                  <Badge variant="neutral">Checking...</Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  icon={RefreshCw}
                  onClick={checkBackendHealth}
                  disabled={isCheckingApi}
                  title="Refresh connectivity status"
                  className={isCheckingApi ? 'animate-spin' : ''}
                >
                  Check
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-slate-800 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-primary-500" />
                <span>Active Session: <strong className="text-gray-700 dark:text-gray-300">{currentUser?.name}</strong> ({ROLE_LABELS[currentUser?.role] || currentUser?.role})</span>
              </div>
              <span>Organization: <strong className="text-gray-700 dark:text-gray-300">{company?.name}</strong></span>
            </div>
          </div>

          {/* Cache Management */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Local Cache Management</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Clear cached preferences and temporary UI states without terminating your active login session.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={Trash2}
              onClick={() => setShowClearCacheModal(true)}
            >
              Clear Cache
            </Button>
          </div>
        </div>
      </Card>

      {/* ── 4. About WorkNest ── */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
            <Info size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">About WorkNest</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">BCA College Mini Project system details.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400 pt-1">
          <div className="space-y-1.5">
            <p><strong className="text-gray-800 dark:text-gray-200">Application:</strong> WorkNest Enterprise Desktop</p>
            <p><strong className="text-gray-800 dark:text-gray-200">Version:</strong> 1.0.0 (Build 2026.09)</p>
            <p><strong className="text-gray-800 dark:text-gray-200">Environment:</strong> Electron 33.2 + Node.js 24 + Vite 6</p>
          </div>
          <div className="space-y-1.5">
            <p><strong className="text-gray-800 dark:text-gray-200">Frontend:</strong> React 18 + Tailwind CSS + Lucide Icons</p>
            <p><strong className="text-gray-800 dark:text-gray-200">Backend:</strong> Express + TypeScript + Prisma ORM</p>
            <p><strong className="text-gray-800 dark:text-gray-200">Database:</strong> PostgreSQL 17 (Relational Multi-Tenant)</p>
          </div>
        </div>
      </Card>

      {/* ── Clear Cache Confirmation Modal ── */}
      <Modal
        isOpen={showClearCacheModal}
        onClose={() => setShowClearCacheModal(false)}
        title="Clear Application Cache"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to clear the local application cache? Your active login token and theme will be preserved, but saved UI filters and temporary states will be reset.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowClearCacheModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" icon={Trash2} onClick={handleClearCache}>
              Confirm Clear
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
