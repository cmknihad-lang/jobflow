import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileText,
  Briefcase,
  CreditCard,
  Settings,
  LogOut,
  MessageSquare,
} from 'lucide-react';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard',  href: '/',          icon: LayoutDashboard },
  { name: 'Customers',  href: '/customers',  icon: Users },
  { name: 'Leads',      href: '/leads',      icon: UserPlus },
  { name: 'Quotations', href: '/quotations', icon: FileText },
  { name: 'Jobs',       href: '/jobs',       icon: Briefcase },
  { name: 'Payments',   href: '/payments',   icon: CreditCard },
  { name: 'Messages',   href: '/messages',   icon: MessageSquare },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <aside className="flex h-screen w-60 flex-col bg-sidebar flex-shrink-0">
      {/* Brand */}
      <div className="flex h-14 items-center px-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-6 rounded bg-accent flex items-center justify-center flex-shrink-0">
            <Briefcase className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">
            JobFlow
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-2 mb-2 text-2xs font-medium text-sidebar-text uppercase tracking-widest">
          Menu
        </p>
        {navigation.map((item) => {
          const isActive =
            item.href === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={clsx(
                'flex items-center gap-3 px-2.5 py-2 rounded-sm text-xs font-medium transition-colors duration-150',
                isActive
                  ? 'bg-sidebar-active text-sidebar-text-active'
                  : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
              )}
            >
              <item.icon
                className={clsx('h-4 w-4 flex-shrink-0', isActive ? 'text-white' : 'text-sidebar-text')}
                strokeWidth={isActive ? 2 : 1.5}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/[0.06] px-3 py-3 space-y-0.5">
        <Link
          to="/settings"
          className={clsx(
            'flex items-center gap-3 px-2.5 py-2 rounded-sm text-xs font-medium transition-colors duration-150',
            location.pathname === '/settings'
              ? 'bg-sidebar-active text-sidebar-text-active'
              : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
          )}
        >
          <Settings className="h-4 w-4 flex-shrink-0 text-sidebar-text" strokeWidth={1.5} />
          Settings
        </Link>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-2.5 py-2 rounded-sm text-xs font-medium text-sidebar-text hover:bg-sidebar-hover hover:text-white transition-colors duration-150"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
