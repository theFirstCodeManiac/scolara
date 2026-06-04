import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Target, TrendingUp, Sparkles, BookOpen, Rss, ArrowRight, Zap, Timer } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [topicsCount, setTopicsCount] = useState(0);
  const [predictionsCount, setPredictionsCount] = useState(0);
  const [plansCount, setPlansCount] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [topPredictions, setTopPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [{ count: tc }, { count: pc }, { count: sc }, { count: sessc }, { data: preds }] = await Promise.all([
        supabase.from('extracted_topics').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('exam_predictions').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('study_plans').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_active', true),
        supabase.from('study_sessions').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
        supabase.from('exam_predictions').select('*').eq('user_id', user.id).order('probability', { ascending: false }).limit(4),
      ]);
      setTopicsCount(tc || 0);
      setPredictionsCount(pc || 0);
      setPlansCount(sc || 0);
      setSessionsCount(sessc || 0);
      setTopPredictions(preds || []);
      setIsLoading(false);
    };
    fetch();
  }, [user]);

  const kpis = [
    {
      label: 'Topics Extracted',
      value: topicsCount,
      suffix: '',
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-500/10',
      empty: 'Upload past questions',
      link: '/dashboard/topics',
    },
    {
      label: 'Focus Sessions',
      value: sessionsCount,
      suffix: 'this week',
      icon: Timer,
      gradient: 'from-violet-500 to-purple-500',
      bg: 'bg-violet-500/10',
      empty: 'Start a session',
      link: '/dashboard/focus',
    },
    {
      label: 'Predictions',
      value: predictionsCount,
      suffix: 'topics',
      icon: Brain,
      gradient: 'from-primary to-indigo-500',
      bg: 'bg-primary/10',
      empty: 'No predictions yet',
      link: '/dashboard/predictions',
    },
    {
      label: 'Active Plans',
      value: plansCount,
      suffix: '',
      icon: Target,
      gradient: 'from-rose-500 to-pink-500',
      bg: 'bg-rose-500/10',
      empty: 'Generate a plan',
      link: '/dashboard/plan',
    },
  ];

  const quickActions = [
    { label: 'Upload Past Questions', desc: 'AI topic extraction', icon: Target, to: '/dashboard/topics', gradient: 'from-primary to-indigo-500' },
    { label: 'Ask AI Tutor', desc: 'Attach PDF & ask', icon: Brain, to: '/dashboard/tutor', gradient: 'from-violet-500 to-purple-500' },
    { label: 'Start Focus Session', desc: 'Pomodoro timer', icon: Timer, to: '/dashboard/focus', gradient: 'from-emerald-500 to-teal-500' },
    { label: 'Social Feed', desc: 'Connect with peers', icon: Rss, to: '/dashboard/feed', gradient: 'from-rose-500 to-pink-500' },
    { label: 'View Predictions', desc: 'Exam likelihood', icon: Sparkles, to: '/dashboard/predictions', gradient: 'from-amber-500 to-orange-500' },
    { label: 'Marketplace', desc: 'Study resources', icon: BookOpen, to: '/dashboard/marketplace', gradient: 'from-cyan-500 to-blue-500' },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-gray-500 animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 border border-gray-800/80 p-6 sm:p-8 shadow-xl">
        {/* Subtle animated grid inside */}
        <div className="absolute inset-0 cyber-grid opacity-40 pointer-events-none" />
        {/* Glow blobs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/20 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-0 w-48 h-48 bg-accent/15 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              System Online · Scolara OS
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {greeting()},{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {user?.first_name || user?.full_name?.split(' ')[0] || 'Student'}
              </span>
            </h1>
            <p className="text-gray-400 mt-2 max-w-lg text-sm sm:text-base">
              {topicsCount > 0
                ? `${topicsCount} topics extracted · ${sessionsCount} focus sessions this week · Keep up the momentum.`
                : 'Your academic OS is ready. Upload past questions to start getting AI-powered exam predictions.'}
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0">
            <Link
              to="/dashboard/topics"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              <Zap size={16} /> Get Predictions <ArrowRight size={14} />
            </Link>
            {user?.university && (
              <p className="text-xs text-gray-500">🎓 {user.university}</p>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link key={kpi.label} to={kpi.link} className="group block">
              <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/80 p-5 hover:border-primary/40 dark:hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5">
                {/* Subtle gradient top bar */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${kpi.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="flex items-start justify-between mb-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-snug">{kpi.label}</p>
                  <div className={`w-8 h-8 ${kpi.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon size={16} className={`bg-gradient-to-br ${kpi.gradient} bg-clip-text text-transparent`} />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{kpi.value}</p>
                <p className="text-xs text-gray-400 mt-1 truncate">
                  {kpi.value === 0 ? kpi.empty : kpi.suffix || 'total'}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Grid: Quick Actions + Top Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Quick Actions</h2>
            <span className="text-xs text-gray-400 font-mono">6 modules</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} to={action.to} className="group block">
                  <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/80 p-4 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5">
                    <div className={`w-9 h-9 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white leading-snug">{action.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
                    <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Top Predictions Panel */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" /> High-Yield Topics
            </h2>
            {topPredictions.length > 0 && (
              <Link to="/dashboard/predictions" className="text-xs text-primary hover:text-accent transition-colors flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            )}
          </div>
          <div className="rounded-2xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/80 overflow-hidden">
            {topPredictions.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="text-amber-400" size={24} />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">No predictions yet</p>
                <p className="text-xs text-gray-500">Upload past questions to generate AI exam predictions.</p>
                <Link to="/dashboard/topics" className="inline-flex items-center gap-1 text-xs text-primary mt-4 hover:text-accent transition-colors">
                  Upload Now <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {topPredictions.map((pred, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{pred.topic_name}</p>
                      <p className="text-xs text-gray-500 font-mono">{pred.course_code}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                        pred.probability >= 75
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : pred.probability >= 50
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        <Zap size={10} /> {pred.probability}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
