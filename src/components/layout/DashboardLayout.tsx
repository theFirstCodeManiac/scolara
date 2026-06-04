import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen, Brain, LayoutDashboard, Target, Calendar,
  Menu, X, LogOut, Timer, Library, MessageSquare, Users, Rss,
  ShoppingBag, TrendingUp, Zap, Mail, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Avatar } from '../ui/Avatar';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Social Feed', href: '/dashboard/feed', icon: Rss },
      { name: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
    ]
  },
  {
    label: 'AI Tools',
    items: [
      { name: 'Topic Ranking', href: '/dashboard/topics', icon: Target },
      { name: 'Predictions', href: '/dashboard/predictions', icon: Zap },
      { name: 'Study Plan', href: '/dashboard/plan', icon: Calendar },
      { name: 'AI Tutor', href: '/dashboard/tutor', icon: Brain },
      { name: 'Question Solver', href: '/dashboard/solver', icon: BookOpen },
    ]
  },
  {
    label: 'Productivity',
    items: [
      { name: 'Focus Mode', href: '/dashboard/focus', icon: Timer },
      { name: 'Last 24 Hours', href: '/dashboard/last24', icon: ShieldAlert },
      { name: 'Library', href: '/dashboard/library', icon: Library },
      { name: 'Marketplace', href: '/dashboard/marketplace', icon: ShoppingBag },
      { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    ]
  },
];

const adminItems = [
  { name: 'Class Intel', href: '/dashboard/class', icon: Users },
  { name: 'Newsletter', href: '/dashboard/newsletter', icon: Mail },
];

export const DashboardLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isSuperAdmin = user?.role === 'super_admin' || user?.email === 'officialscolara@gmail.com';
  const isAdmin = user?.role === 'class_rep' || user?.role === 'admin' || isSuperAdmin;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-950 border-r border-gray-800/60">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white text-base shadow-lg shadow-primary/20">
            S
          </div>
          <span className="text-lg font-extrabold text-white tracking-tight">Scolara</span>
          <span className="hidden sm:block text-[10px] bg-primary/15 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full font-mono">OS</span>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1.5 text-gray-500 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Nav Groups */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-2 mb-2">{group.label}</p>
            {group.items.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/15 text-white border border-primary/20 shadow-sm shadow-primary/10'
                      : 'text-gray-500 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <Icon
                    size={17}
                    className={`flex-shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-gray-600 group-hover:text-gray-400'}`}
                  />
                  <span className="truncate">{item.name}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Admin Section */}
        {isAdmin && (
          <div className="mb-4">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-2 mb-2">Admin</p>
            {adminItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/15 text-white border border-primary/20'
                      : 'text-gray-500 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <Icon size={17} className={`flex-shrink-0 ${isActive ? 'text-primary' : 'text-gray-600 group-hover:text-gray-400'}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-gray-800/60">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-900/60 border border-gray-800/50 mb-2">
          <Avatar
            src={user?.avatar_url}
            initials={user?.first_name?.charAt(0)?.toUpperCase() || user?.full_name?.charAt(0)?.toUpperCase() || '?'}
            size="sm"
            className="ring-2 ring-primary/20"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.first_name || user?.full_name?.split(' ')[0] || 'Student'}
            </p>
            <p className="text-xs text-gray-500 truncate font-mono">
              {user?.matric_number || user?.role?.replace('_', ' ') || 'student'}
            </p>
          </div>
          <ThemeToggle />
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center w-full gap-2 px-3 py-2 text-xs font-medium text-gray-500 hover:text-red-400 rounded-xl hover:bg-red-900/10 transition-all"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-gray-950 border-b border-gray-800/60 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white text-sm">S</div>
          <span className="text-base font-extrabold text-white">Scolara</span>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-400 hover:text-white transition-colors">
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-60 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
