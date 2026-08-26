import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ToastContainer from '../ui/Toast';
import { useApp } from '../../contexts/AppContext';

export default function AppShell() {
  const { isAuthenticated } = useApp();
  const navigate = useNavigate();

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
