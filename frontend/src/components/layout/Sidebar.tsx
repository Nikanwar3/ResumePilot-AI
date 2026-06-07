import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Search,
  User,
  Settings,
  X,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/interview', icon: MessageSquare, label: 'AI Interview' },
  { to: '/resumes', icon: FileText, label: 'My Resumes' },
  { to: '/job-analyzer', icon: Search, label: 'Job Analyzer' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-30 w-64 flex-shrink-0',
          'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700',
          'flex flex-col transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white">ResumePilot</span>
              <span className="text-brand-600 font-bold"> AI</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                )
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-brand-50 dark:bg-brand-900/20 rounded-lg p-3">
            <p className="text-xs font-medium text-brand-700 dark:text-brand-400">ATS Score Tip</p>
            <p className="text-xs text-brand-600 dark:text-brand-500 mt-1">
              Use job-specific keywords to boost your ATS score above 80%
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
