import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Shield, Trophy, ShieldAlert, BarChart3, Check, X,
  BadgeCheck, Volume2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useHub } from '../../context/HubContext';

type Tab = 'analytics' | 'tutors' | 'moderation' | 'announcements';

export const HubAdminPanel: React.FC = () => {
  const { hubUser } = useHub();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalAspirants: 0, totalTutors: 0, totalGroups: 0, totalEarnings: 0 });
  const [tutors, setTutors] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('analytics');
  const [loading, setLoading] = useState(true);

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  useEffect(() => {
    if (hubUser) {
      if ((hubUser.role as string) !== 'admin' && (hubUser.role as string) !== 'super_admin') {
        navigate('/hub');
        return;
      }
      fetchAdminData();
    }
  }, [hubUser]);

  const fetchAdminData = async () => {
    setLoading(true);

    // Platform statistics
    const { count: aspirantsCount } = await supabase.from('hub_aspirants').select('*', { count: 'exact', head: true });
    const { count: tutorsCount } = await supabase.from('hub_tutors').select('*', { count: 'exact', head: true });
    const { count: groupsCount } = await supabase.from('hub_groups').select('*', { count: 'exact', head: true });
    const { data: payments } = await supabase.from('hub_payments').select('amount_naira');

    const totalEarnings = (payments || []).reduce((a, p) => a + (p.amount_naira || 0), 0);
    setStats({
      totalAspirants: aspirantsCount || 0,
      totalTutors: tutorsCount || 0,
      totalGroups: groupsCount || 0,
      totalEarnings,
    });

    // Pending/Active Tutors list
    const { data: tutorsData } = await supabase
      .from('hub_tutors')
      .select('*')
      .order('is_verified', { ascending: true });
    setTutors(tutorsData || []);

    // Groups list
    const { data: groupsData } = await supabase
      .from('hub_groups')
      .select('*, hub_tutors(bio)');
    setGroups(groupsData || []);

    setLoading(false);
  };

  const handleVerifyTutor = async (tutorId: string, currentStatus: boolean) => {
    await supabase.from('hub_tutors').update({ is_verified: !currentStatus }).eq('id', tutorId);
    fetchAdminData();
  };

  const handleToggleGroup = async (groupId: string, currentActive: boolean) => {
    await supabase.from('hub_groups').update({ is_active: !currentActive }).eq('id', groupId);
    fetchAdminData();
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) return;
    setBroadcasting(true);

    // Create system notification for all aspirants
    const { data: students } = await supabase.from('hub_aspirants').select('user_id');
    if (students && students.length > 0) {
      const notifications = students.map(s => ({
        user_id: s.user_id,
        title: broadcastTitle.trim(),
        message: broadcastBody.trim(),
        notification_type: 'announcement',
      }));
      await supabase.from('hub_notifications').insert(notifications);
      alert('Platform broadcast notification sent to all candidates!');
      setBroadcastTitle('');
      setBroadcastBody('');
    }
    setBroadcasting(false);
  };

  if (loading) {
    return (
      <div className="bg-hub-dark-bg min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-hub-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass = "w-full bg-hub-dark-bg border border-hub-dark-border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-hub-gold/50";

  return (
    <div className="bg-hub-dark-bg min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="text-hub-gold" size={28} />
          <div>
            <h1 className="text-3xl font-extrabold text-white">Hub Admin Dashboard</h1>
            <p className="text-gray-400">Moderation, tutor verification, platform analytics & broadcasts</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-hub-dark-border overflow-x-auto pb-px mb-8 scrollbar-hide">
          {[
            { key: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} /> },
            { key: 'tutors', label: 'Verify Tutors', icon: <BadgeCheck size={16} /> },
            { key: 'moderation', label: 'Moderate Groups', icon: <ShieldAlert size={16} /> },
            { key: 'announcements', label: 'Global Broadcast', icon: <Volume2 size={16} /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as Tab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all flex-shrink-0 ${
                activeTab === tab.key
                  ? 'border-hub-gold text-hub-gold'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'analytics' && (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Aspirants', value: stats.totalAspirants.toLocaleString(), icon: Users, color: 'text-hub-gold' },
                { label: 'Verified Tutors', value: stats.totalTutors.toLocaleString(), icon: BadgeCheck, color: 'text-hub-aqua' },
                { label: 'Total Groups', value: stats.totalGroups.toLocaleString(), icon: ShieldAlert, color: 'text-purple-400' },
                { label: 'Total Transactions', value: `₦${stats.totalEarnings.toLocaleString()}`, icon: Trophy, color: 'text-green-400' },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="p-6 bg-hub-dark-surface border border-hub-dark-border rounded-2xl">
                    <Icon className={`${item.color} mb-3`} size={24} />
                    <div className="text-2xl font-extrabold text-white">{item.value}</div>
                    <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'tutors' && (
          <div className="bg-hub-dark-surface border border-hub-dark-border rounded-3xl overflow-hidden">
            <div className="p-5 border-b border-hub-dark-border">
              <h3 className="font-bold text-white">Tutor Profiles</h3>
            </div>
            <div className="divide-y divide-hub-dark-border/40">
              {tutors.map(t => (
                <div key={t.id} className="p-5 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white">Tutor profile</span>
                      {t.is_verified && <BadgeCheck size={14} className="text-hub-aqua" />}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{t.bio || 'No bio provided'}</p>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {t.subjects?.map((s: string) => (
                        <span key={s} className="px-2 py-0.5 bg-hub-dark-bg text-hub-gold text-[10px] rounded-full border border-hub-dark-border">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerifyTutor(t.id, t.is_verified)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                        t.is_verified
                          ? 'bg-red-950/20 text-red-400 border border-red-900/30'
                          : 'bg-green-950/20 text-green-400 border border-green-900/30'
                      }`}
                    >
                      {t.is_verified ? <X size={12} /> : <Check size={12} />}
                      {t.is_verified ? 'Revoke Verification' : 'Verify Tutor'}
                    </button>
                  </div>
                </div>
              ))}
              {tutors.length === 0 && <div className="p-8 text-center text-gray-500">No tutor profiles found.</div>}
            </div>
          </div>
        )}

        {activeTab === 'moderation' && (
          <div className="bg-hub-dark-surface border border-hub-dark-border rounded-3xl overflow-hidden">
            <div className="p-5 border-b border-hub-dark-border">
              <h3 className="font-bold text-white">Group Moderation</h3>
            </div>
            <div className="divide-y divide-hub-dark-border/40">
              {groups.map(g => (
                <div key={g.id} className="p-5 flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h4 className="font-bold text-white text-sm">{g.name}</h4>
                    <p className="text-xs text-hub-aqua mt-0.5">{g.university}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleGroup(g.id, g.is_active)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        g.is_active
                          ? 'bg-red-950/20 text-red-400 border-red-900/30'
                          : 'bg-green-950/20 text-green-400 border-green-900/30'
                      }`}
                    >
                      {g.is_active ? 'Suspend Group' : 'Restore Group'}
                    </button>
                  </div>
                </div>
              ))}
              {groups.length === 0 && <div className="p-8 text-center text-gray-500">No groups found.</div>}
            </div>
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="max-w-xl bg-hub-dark-surface border border-hub-dark-border rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Volume2 className="text-hub-gold" /> Global Broadcast System
            </h3>
            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Broadcast Title *</label>
                <input type="text" value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} placeholder="Enter title (e.g. Server Maintenance or Exam Reminder)" required className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Message Content *</label>
                <textarea value={broadcastBody} onChange={e => setBroadcastBody(e.target.value)} placeholder="Provide full details. All hub users will receive this." rows={4} required className={`${inputClass} resize-none`} />
              </div>
              <button type="submit" disabled={broadcasting} className="w-full py-3.5 bg-hub-gold text-hub-navy font-bold text-sm rounded-xl hover:bg-hub-gold-dark flex items-center justify-center gap-2">
                {broadcasting ? 'Sending...' : 'Send Broadcast'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
