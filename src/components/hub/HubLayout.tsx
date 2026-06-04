import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  GraduationCap, Home, Users, BookOpen, Bell, MessageSquare,
  Menu, X, LogOut, LayoutDashboard, Layers, Trophy, Sparkles,
  ChevronRight, Mic2
} from 'lucide-react';
import { useHub } from '../../context/HubContext';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { name: 'Hub Home', href: '/hub', icon: Home, exact: true },
  { name: 'Tutor Directory', href: '/hub/tutors', icon: Users },
  { name: 'My Groups', href: '/hub/groups', icon: Layers },
  { name: 'Resources', href: '/hub/resources', icon: BookOpen },
  { name: 'Leaderboard', href: '/hub/leaderboard', icon: Trophy },
  { name: 'Messages', href: '/hub/messages', icon: MessageSquare },
  { name: 'Scolara AI', href: '/hub/ai', icon: Sparkles },
];

const tutorItems = [
  { name: 'Tutor Panel', href: '/hub/tutor-panel', icon: LayoutDashboard },
];

export const HubLayout: React.FC = () => {
  const { hubUser, hubSignOut, unreadCount } = useHub();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await hubSignOut();
    navigate('/hub');
  };

  const isTutor = hubUser?.role === 'hub_tutor';
  const displayName = hubUser?.aspirant?.full_name || hubUser?.tutor?.bio?.split(' ')[0] || hubUser?.email || 'User';

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-hub-dark-bg border-r border-hub-dark-border">
      {/* Brand */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-hub-dark-border">
        <Link to="/hub" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-hub-gold to-hub-aqua flex items-center justify-center shadow-lg shadow-hub-gold/20">
            <GraduationCap size={18} className="text-hub-navy" />
          </div>
          <div>
            <span className="text-base font-extrabold text-white tracking-tight leading-none block">Scolara</span>
            <span className="text-[10px] text-hub-gold font-semibold tracking-wider">POST-UTME HUB</span>
          </div>
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1.5 text-gray-500 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-2 mb-2">Navigation</p>
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-hub-gold/15 text-hub-gold border border-hub-gold/25 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-hub-dark-surface'
              }`}
            >
              <Icon size={17} className={`flex-shrink-0 ${active ? 'text-hub-gold' : 'text-gray-600 group-hover:text-gray-300'}`} />
              <span className="truncate">{item.name}</span>
              {item.name === 'Messages' && unreadCount > 0 && (
                <span className="ml-auto bg-hub-gold text-hub-navy text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              {active && <ChevronRight size={14} className="ml-auto text-hub-gold/60" />}
            </Link>
          );
        })}

        {isTutor && (
          <>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-2 mb-2 mt-4">Tutor Tools</p>
            {tutorItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-hub-aqua/15 text-hub-aqua border border-hub-aqua/25'
                      : 'text-gray-400 hover:text-white hover:bg-hub-dark-surface'
                  }`}
                >
                  <Icon size={17} className={`${active ? 'text-hub-aqua' : 'text-gray-600 group-hover:text-gray-300'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </>
        )}

        {/* Voice Rooms - Coming Soon */}
        <div className="mt-4">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-2 mb-2">Community</p>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 cursor-not-allowed">
            <Mic2 size={17} className="text-gray-700" />
            <span>Voice Rooms</span>
            <span className="ml-auto text-[9px] bg-hub-aqua/10 text-hub-aqua border border-hub-aqua/20 px-1.5 py-0.5 rounded-full">Soon</span>
          </div>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-hub-dark-border">
        {hubUser ? (
          <>
            <Link
              to="/hub/profile"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl bg-hub-dark-surface border border-hub-dark-border mb-2 hover:border-hub-gold/30 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-hub-gold to-hub-aqua flex items-center justify-center text-hub-navy font-bold text-sm flex-shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">{isTutor ? '🎓 Tutor' : '📚 Aspirant'}</p>
              </div>
              <Bell size={14} className="text-gray-600" />
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center w-full gap-2 px-3 py-2 text-xs font-medium text-gray-500 hover:text-red-400 rounded-xl hover:bg-red-900/10 transition-all"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </>
        ) : (
          <div className="space-y-2">
            <Link
              to="/hub/login"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-3 py-2.5 bg-hub-gold text-hub-navy text-sm font-bold rounded-xl hover:bg-hub-gold-dark transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/hub/register"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-3 py-2.5 border border-hub-gold/30 text-hub-gold text-sm font-medium rounded-xl hover:bg-hub-gold/10 transition-colors"
            >
              Register Free
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-hub-dark-bg flex flex-col md:flex-row font-sans">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-hub-dark-bg border-b border-hub-dark-border sticky top-0 z-30">
        <Link to="/hub" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-hub-gold to-hub-aqua flex items-center justify-center">
            <GraduationCap size={16} className="text-hub-navy" />
          </div>
          <div>
            <span className="text-sm font-extrabold text-white">Scolara</span>
            <span className="text-[9px] text-hub-gold font-bold ml-1">HUB</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {hubUser && (
            <Link to="/hub/notifications" className="relative p-2 text-gray-400 hover:text-white">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-hub-gold rounded-full" />
              )}
            </Link>
          )}
          {!hubUser && (
            <Link to="/hub/login" className="px-3 py-1.5 bg-hub-gold text-hub-navy text-xs font-bold rounded-lg">
              Sign In
            </Link>
          )}
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-400 hover:text-white">
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Desktop top bar */}
        <div className="hidden md:flex items-center justify-between px-6 py-3 border-b border-hub-dark-border bg-hub-dark-bg/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="text-sm text-gray-500">
            {/* Breadcrumb can go here */}
          </div>
          <div className="flex items-center gap-3">
            {hubUser ? (
              <>
                <Link to="/hub/notifications" className="relative p-2 text-gray-400 hover:text-hub-gold transition-colors rounded-lg hover:bg-hub-dark-surface">
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-hub-gold rounded-full animate-pulse" />
                  )}
                </Link>
                <Link to="/hub/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-hub-dark-surface transition-colors">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-hub-gold to-hub-aqua flex items-center justify-center text-hub-navy font-bold text-xs">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-white font-medium">{displayName.split(' ')[0]}</span>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/hub/login" className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-hub-dark-surface transition-colors">Sign In</Link>
                <Link to="/hub/register" className="text-sm font-bold bg-hub-gold text-hub-navy px-4 py-1.5 rounded-lg hover:bg-hub-gold-dark transition-colors">Get Started</Link>
              </div>
            )}
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
