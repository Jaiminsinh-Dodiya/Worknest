import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { demoAccounts } from '../data/users';
import { getDashboardPath } from '../config/roles';
import TitleBar from '../components/layout/TitleBar';

export default function Login() {
  const [email, setEmail] = useState('owner@worknest.local');
  const [password, setPassword] = useState('owner123');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useApp();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    // Simulate small network delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    const result = login(email, password);

    if (result.success) {
      const destination = getDashboardPath(result.user.role);
      navigate(destination);
    } else {
      setErrorMessage(result.error || 'Invalid email or password.');
      setIsLoading(false);
    }
  };

  const handleSelectDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setErrorMessage('');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden">
      <TitleBar title="WorkNest — Login" />
      <div className="flex-1 flex items-center justify-center px-4 py-6 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
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

          {/* Quick Demo Account Selector */}
          <div className="mt-5 p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2.5 text-center">
              Switch Mock Role (Evaluation Demo)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {demoAccounts.map((account) => {
                const isSelected = email === account.email;
                return (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => handleSelectDemo(account)}
                    className={`px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer border ${
                      isSelected
                        ? 'bg-primary-50 border-primary-300 text-primary-700 dark:bg-primary-900/30 dark:border-primary-600 dark:text-primary-300 shadow-xs'
                        : 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <p className="font-semibold truncate">{account.label}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{account.email.split('@')[0]}</p>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2.5 text-center">
              Click any role card to populate credentials and test role-specific dashboards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
