import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Shield,
  Crown,
  Users,
  Briefcase,
  Zap,
  Database,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { authService } from '../services/authService';
import { getDashboardPath } from '../config/roles';
import TitleBar from '../components/layout/TitleBar';

const ROLE_THEMES = {
  SUPER_ADMIN: {
    bg: 'bg-purple-50/70 hover:bg-purple-100/80 dark:bg-purple-950/20 dark:hover:bg-purple-900/30',
    border: 'border-purple-200 dark:border-purple-800/60',
    selectedBorder: 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50 dark:bg-purple-900/30',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    icon: Shield,
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  COMPANY_OWNER: {
    bg: 'bg-amber-50/70 hover:bg-amber-100/80 dark:bg-amber-950/20 dark:hover:bg-amber-900/30',
    border: 'border-amber-200 dark:border-amber-800/60',
    selectedBorder: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50 dark:bg-amber-900/30',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    icon: Crown,
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  HR: {
    bg: 'bg-emerald-50/70 hover:bg-emerald-100/80 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    selectedBorder: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50 dark:bg-emerald-900/30',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    icon: Users,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  MANAGER: {
    bg: 'bg-blue-50/70 hover:bg-blue-100/80 dark:bg-blue-950/20 dark:hover:bg-blue-900/30',
    border: 'border-blue-200 dark:border-blue-800/60',
    selectedBorder: 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 dark:bg-blue-900/30',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    icon: Briefcase,
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  EMPLOYEE: {
    bg: 'bg-indigo-50/70 hover:bg-indigo-100/80 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30',
    border: 'border-indigo-200 dark:border-indigo-800/60',
    selectedBorder: 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50 dark:bg-indigo-900/30',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
    icon: Zap,
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Live Demo Accounts state (fetched from PostgreSQL)
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [loadingDemo, setLoadingDemo] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected' | 'offline' | 'checking'

  const navigate = useNavigate();
  const { login } = useApp();

  const loadDemoAccounts = useCallback(async () => {
    setLoadingDemo(true);
    try {
      const accounts = await authService.getDemoAccounts();
      if (accounts && accounts.length > 0) {
        setDemoAccounts(accounts);
        setBackendStatus('connected');
      } else {
        setBackendStatus('offline');
      }
    } catch {
      setBackendStatus('offline');
    } finally {
      setLoadingDemo(false);
    }
  }, []);

  useEffect(() => {
    loadDemoAccounts();
  }, [loadDemoAccounts]);

  const executeLogin = async (loginEmail, loginPassword) => {
    setErrorMessage('');
    setIsLoading(true);

    const result = await login(loginEmail, loginPassword);

    if (result.success) {
      const destination = getDashboardPath(result.user.role);
      navigate(destination);
    } else {
      setErrorMessage(result.error || 'Invalid email or password.');
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeLogin(email, password);
  };

  const handleSelectDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setErrorMessage('');
  };

  const handleQuickLogin = (e, account) => {
    e.stopPropagation();
    setEmail(account.email);
    setPassword(account.password);
    executeLogin(account.email, account.password);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden">
      <TitleBar title="WorkNest — Login" />
      <div className="flex-1 flex items-center justify-center px-4 py-6 overflow-y-auto">
        <div className="w-full max-w-xl my-auto">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 rounded-2xl mb-3 shadow-md shadow-primary-500/20">
              <span className="text-white font-bold text-xl">W</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">WorkNest</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Multi-Tenant Workforce & Project Platform</p>
          </div>

          {/* Login Card */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-700 dark:text-red-400 animate-fadeIn">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={16} />
                    Sign In to Workspace
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Demo Account Selector (Development & College Evaluation) */}
          <div className="mt-5 p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    backendStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    backendStatus === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Quick Demo Accounts
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                <Database size={12} className={backendStatus === 'connected' ? 'text-emerald-500' : 'text-amber-500'} />
                <span>{backendStatus === 'connected' ? 'PostgreSQL 17 Live' : 'Backend Offline'}</span>
              </div>
            </div>

            {loadingDemo ? (
              <div className="flex items-center justify-center py-6 gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                Querying active demo accounts from PostgreSQL...
              </div>
            ) : backendStatus === 'offline' ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                <span>Backend offline. Start backend on port 3001 to load database accounts.</span>
                <button
                  type="button"
                  onClick={loadDemoAccounts}
                  className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-800/60 rounded text-[11px] font-semibold text-amber-900 dark:text-amber-200 transition-colors cursor-pointer"
                >
                  <RefreshCw size={11} /> Retry
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {demoAccounts.map((account) => {
                    const isSelected = email === account.email;
                    const theme = ROLE_THEMES[account.role] || ROLE_THEMES.EMPLOYEE;
                    const IconComponent = theme.icon;

                    return (
                      <div
                        key={account.id || account.email}
                        onClick={() => handleSelectDemo(account)}
                        className={`group relative p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? theme.selectedBorder
                            : `${theme.border} ${theme.bg} hover:border-gray-400 dark:hover:border-slate-500`
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <IconComponent size={14} className={theme.iconColor} />
                              <span className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                                {account.label}
                              </span>
                            </div>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${theme.badge}`}>
                              {account.department || account.role}
                            </span>
                          </div>

                          <div className="text-[11px] text-gray-700 dark:text-gray-200 font-medium truncate mb-1">
                            {account.name}
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal ml-1">
                              ({account.companyName})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-gray-200/60 dark:border-slate-700/60 mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                          <span className="font-mono text-[10.5px] truncate max-w-[150px]">{account.email}</span>
                          <button
                            type="button"
                            onClick={(e) => handleQuickLogin(e, account)}
                            title="1-Click Instant Sign In"
                            className="ml-1 px-2 py-0.5 bg-primary-600 hover:bg-primary-700 text-white rounded text-[10.5px] font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                          >
                            <Zap size={10} className="fill-current" />
                            Sign In
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center pt-1">
                  Click a card to auto-fill credentials, or click <strong className="text-primary-600 dark:text-primary-400 font-semibold">Sign In ⚡</strong> for instant 1-click access.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
