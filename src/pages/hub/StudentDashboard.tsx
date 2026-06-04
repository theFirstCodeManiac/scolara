import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Trophy, Users, ArrowRight, ShieldCheck,
  Sparkles, Bookmark
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useHub } from '../../context/HubContext';

export const StudentDashboard: React.FC = () => {
  const { hubUser, hubSignOut } = useHub();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ groupsCount: 0, examsTaken: 0, avgScore: 0, resourcesSaved: 0 });
  const [joinedGroups, setJoinedGroups] = useState<any[]>([]);
  const [recentExams, setRecentExams] = useState<any[]>([]);
  const [bookmarkedResources, setBookmarkedResources] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hubUser) {
      fetchDashboardData();
    } else {
      navigate('/hub/login');
    }
  }, [hubUser]);

  const fetchDashboardData = async () => {
    setLoading(true);
    if (!hubUser) return;

    // Joined groups count & details
    const { data: groups } = await supabase
      .from('hub_group_members')
      .select('*, hub_groups(*, hub_tutors(id, bio))')
      .eq('user_id', hubUser.id)
      .eq('payment_status', 'paid');
    setJoinedGroups(groups || []);

    // Exams taken
    const { data: sessions } = await supabase
      .from('hub_exam_sessions')
      .select('*, hub_exams(*)')
      .eq('student_id', hubUser.id)
      .eq('status', 'submitted');
    setRecentExams(sessions || []);

    // Bookmarked resources
    const { data: bookmarks } = await supabase
      .from('hub_resource_bookmarks')
      .select('*, hub_resources(*)')
      .eq('user_id', hubUser.id);
    setBookmarkedResources(bookmarks || []);

    // Payments
    const { data: payHistory } = await supabase
      .from('hub_payments')
      .select('*, hub_groups(name)')
      .eq('user_id', hubUser.id)
      .order('created_at', { ascending: false });
    setPayments(payHistory || []);

    // Aggregate stats
    const groupsCount = groups?.length || 0;
    const examsTaken = sessions?.length || 0;
    const resourcesSaved = bookmarks?.length || 0;
    const totalScore = sessions?.reduce((a, s) => a + (s.percentage || 0), 0) || 0;
    const avgScore = examsTaken > 0 ? totalScore / examsTaken : 0;

    setStats({ groupsCount, examsTaken, avgScore, resourcesSaved });
    setLoading(false);
  };

  const fadeUp = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="bg-hub-dark-bg min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-hub-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-hub-dark-bg min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <motion.div {...fadeUp}>
            <h1 className="text-3xl font-extrabold text-white">Welcome, {hubUser?.aspirant?.full_name || 'Aspirant'}</h1>
            <p className="text-gray-400">Track your Post-UTME preparation progress and performance</p>
          </motion.div>
          <div className="flex gap-2">
            <Link
              to="/hub/ai"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-hub-gold to-hub-aqua text-hub-navy font-bold text-sm rounded-xl hover:opacity-90 transition-all shadow-lg shadow-hub-gold/25"
            >
              <Sparkles size={16} /> Scolara AI Tutor
            </Link>
            <button
              onClick={hubSignOut}
              className="px-4 py-2 border border-hub-dark-border text-gray-400 font-semibold text-sm rounded-xl hover:text-white hover:bg-hub-dark-surface"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Joined Groups', value: stats.groupsCount, icon: Users, color: 'text-hub-gold', bg: 'bg-hub-gold/5' },
            { label: 'Exams Attempted', value: stats.examsTaken, icon: Zap, color: 'text-hub-aqua', bg: 'bg-hub-aqua/5' },
            { label: 'Average Score', value: `${stats.avgScore.toFixed(0)}%`, icon: Trophy, color: 'text-green-400', bg: 'bg-green-500/5' },
            { label: 'Saved Materials', value: stats.resourcesSaved, icon: Bookmark, color: 'text-purple-400', bg: 'bg-purple-500/5' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-6 border border-hub-dark-border rounded-2xl ${item.bg}`}
              >
                <Icon size={22} className={`${item.color} mb-3`} />
                <div className="text-2xl font-extrabold text-white">{item.value}</div>
                <div className="text-xs text-gray-500 mt-1">{item.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Mid Section layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Active Study Groups */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">My Study Groups</h2>
              <Link to="/hub/groups" className="text-xs text-hub-gold hover:underline flex items-center gap-1">
                Explore more <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {joinedGroups.map(item => (
                <Link key={item.id} to={`/hub/groups/${item.group_id}`}>
                  <div className="p-5 bg-hub-dark-surface border border-hub-dark-border rounded-2xl hover:border-hub-gold/30 transition-all flex flex-col justify-between h-36">
                    <div>
                      <h3 className="font-bold text-white truncate">{item.hub_groups?.name}</h3>
                      <p className="text-xs text-hub-aqua mt-0.5">{item.hub_groups?.university}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-4 border-t border-hub-dark-border/40 pt-3">
                      <span>Joined {new Date(item.joined_at).toLocaleDateString()}</span>
                      <span className="font-bold text-hub-gold">Enter Group →</span>
                    </div>
                  </div>
                </Link>
              ))}
              {joinedGroups.length === 0 && (
                <div className="col-span-2 p-8 bg-hub-dark-surface/30 border border-dashed border-hub-dark-border rounded-2xl text-center">
                  <p className="text-sm text-gray-400 mb-3">You haven't joined any preparation groups yet.</p>
                  <Link to="/hub/groups" className="inline-flex items-center gap-1.5 px-4 py-2 bg-hub-gold text-hub-navy text-xs font-bold rounded-xl hover:bg-hub-gold-dark">
                    Browse Groups <ArrowRight size={13} />
                  </Link>
                </div>
              )}
            </div>

            {/* Bookmarked Materials */}
            <div className="pt-4">
              <h2 className="text-xl font-bold text-white mb-4">Saved Resources</h2>
              <div className="space-y-3">
                {bookmarkedResources.map(bm => (
                  <div key={bm.id} className="p-4 bg-hub-dark-surface border border-hub-dark-border rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Bookmark size={16} className="text-hub-gold" />
                      <div>
                        <h4 className="text-sm font-semibold text-white">{bm.hub_resources?.title}</h4>
                        <span className="text-[10px] text-gray-500 uppercase">{bm.hub_resources?.resource_type}</span>
                      </div>
                    </div>
                    {bm.hub_resources?.file_url && (
                      <a href={bm.hub_resources.file_url} target="_blank" rel="noreferrer" className="text-xs text-hub-gold hover:underline">
                        Download
                      </a>
                    )}
                  </div>
                ))}
                {bookmarkedResources.length === 0 && (
                  <p className="text-xs text-gray-500 italic">No saved resources. Bookmark study materials inside groups to see them here.</p>
                )}
              </div>
            </div>
          </div>

          {/* Performance Summary & Recommendations */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Recent Exams</h2>
              <div className="space-y-3">
                {recentExams.map(sess => (
                  <div key={sess.id} className="p-4 bg-hub-dark-surface border border-hub-dark-border rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{sess.hub_exams?.title}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">{new Date(sess.submitted_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${sess.percentage >= sess.hub_exams?.pass_mark ? 'text-green-400' : 'text-red-400'}`}>
                        {sess.percentage.toFixed(0)}%
                      </span>
                      <p className="text-[10px] text-gray-500">{sess.percentage >= sess.hub_exams?.pass_mark ? 'Passed' : 'Failed'}</p>
                    </div>
                  </div>
                ))}
                {recentExams.length === 0 && (
                  <p className="text-xs text-gray-500 italic">No mock exams attempted yet.</p>
                )}
              </div>
            </div>

            {/* Payment History */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Payment Receipts</h2>
              <div className="space-y-3 bg-hub-dark-surface/50 border border-hub-dark-border rounded-2xl p-4">
                {payments.map(p => (
                  <div key={p.id} className="flex justify-between items-center py-2 border-b border-hub-dark-border last:border-b-0">
                    <div>
                      <p className="text-xs font-semibold text-white">{p.hub_groups?.name || 'Group Access'}</p>
                      <p className="text-[10px] text-gray-500">Ref: {p.reference.substring(0, 10)}...</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-white">₦{p.amount_naira}</span>
                      <p className="text-[9px] text-green-400 flex items-center gap-0.5 justify-end"><ShieldCheck size={9} /> Paid</p>
                    </div>
                  </div>
                ))}
                {payments.length === 0 && (
                  <p className="text-xs text-gray-500 italic">No payment receipts found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
