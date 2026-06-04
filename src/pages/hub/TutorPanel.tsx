import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Users, BookOpen, Settings, Plus,
  BadgeCheck, Loader2, ArrowRight, DollarSign, Wallet
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useHub } from '../../context/HubContext';

type Tab = 'groups' | 'create-group' | 'students' | 'finances' | 'profile';

export const TutorPanel: React.FC = () => {
  const { hubUser } = useHub();
  const navigate = useNavigate();
  const [searchParams, _setSearchParams] = useSearchParams();
  const defaultTab = (searchParams.get('tab') as Tab) || 'groups';

  const [tutor, setTutor] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [earnings, setEarnings] = useState({ totalEarned: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  // Group creation state
  const [groupForm, setGroupForm] = useState({ name: '', description: '', university: '', subjects: '', visibility: 'public', join_fee: 500 });
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Profile state
  const [bio, setBio] = useState('');
  const [subjectsText, setSubjectsText] = useState('');
  const [universitiesText, setUniversitiesText] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    if (hubUser) {
      if (hubUser.role !== 'hub_tutor') {
        navigate('/hub');
        return;
      }
      fetchTutorData();
    }
  }, [hubUser]);

  const fetchTutorData = async () => {
    setLoading(true);
    if (!hubUser) return;

    // Fetch tutor profile
    const { data: tutorData } = await supabase
      .from('hub_tutors')
      .select('*')
      .eq('user_id', hubUser.id)
      .single();

    if (tutorData) {
      setTutor(tutorData);
      setBio(tutorData.bio || '');
      setSubjectsText(tutorData.subjects?.join(', ') || '');
      setUniversitiesText(tutorData.universities?.join(', ') || '');

      // Fetch groups managed by this tutor
      const { data: groupsData } = await supabase
        .from('hub_groups')
        .select(`
          *,
          hub_group_members(count),
          hub_resources(count),
          hub_exams(count)
        `)
        .eq('tutor_id', tutorData.id);
      setGroups(groupsData || []);

      // Fetch all member applications or active members
      if (groupsData && groupsData.length > 0) {
        const { data: mems } = await supabase
          .from('hub_group_members')
          .select('*, hub_aspirants(full_name), hub_groups(name)')
          .in('group_id', groupsData.map(g => g.id))
          .order('joined_at', { ascending: false });
        setMembers(mems || []);
      }

      // Calculate total earnings
      const totalEarned = (groupsData || []).reduce((a, g) => a + ((g.member_count || 0) * (g.join_fee_naira || 500)), 0);
      setEarnings({ totalEarned, balance: totalEarned * 0.85 }); // 15% Platform commission
    }
    setLoading(false);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutor || !groupForm.name.trim()) return;
    setCreatingGroup(true);

    const { error } = await supabase.from('hub_groups').insert({
      tutor_id: tutor.id,
      name: groupForm.name.trim(),
      description: groupForm.description.trim(),
      university: groupForm.university.trim() || null,
      subjects: groupForm.subjects.split(',').map(s => s.trim()).filter(Boolean),
      visibility: groupForm.visibility,
      join_fee_naira: Number(groupForm.join_fee),
    });

    if (!error) {
      setGroupForm({ name: '', description: '', university: '', subjects: '', visibility: 'public', join_fee: 500 });
      setActiveTab('groups');
      fetchTutorData();
    }
    setCreatingGroup(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutor) return;
    setUpdatingProfile(true);

    await supabase
      .from('hub_tutors')
      .update({
        bio: bio.trim(),
        subjects: subjectsText.split(',').map(s => s.trim()).filter(Boolean),
        universities: universitiesText.split(',').map(u => u.trim()).filter(Boolean),
      })
      .eq('id', tutor.id);

    setUpdatingProfile(false);
    fetchTutorData();
  };

  const toggleGroupStatus = async (groupId: string, currentActive: boolean) => {
    await supabase.from('hub_groups').update({ is_active: !currentActive }).eq('id', groupId);
    fetchTutorData();
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold text-white">Tutor Panel</h1>
              {tutor?.is_verified && (
                <span className="flex items-center gap-1 bg-hub-gold/10 border border-hub-gold/25 px-2 py-0.5 rounded-full text-hub-gold text-xs font-semibold">
                  <BadgeCheck size={13} /> Verified Tutor
                </span>
              )}
            </div>
            <p className="text-gray-400">Manage your study groups, exams, resources, and view performance analytics</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-hub-dark-border overflow-x-auto pb-px mb-8 scrollbar-hide">
          {[
            { key: 'groups', label: 'Groups & Content', icon: <BookOpen size={16} /> },
            { key: 'create-group', label: 'Create Group', icon: <Plus size={16} /> },
            { key: 'students', label: 'Students', icon: <Users size={16} /> },
            { key: 'finances', label: 'Earnings', icon: <Wallet size={16} /> },
            { key: 'profile', label: 'Profile Settings', icon: <Settings size={16} /> },
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

        {/* Tab content */}
        {activeTab === 'groups' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map(group => (
              <div key={group.id} className="p-6 bg-hub-dark-surface border border-hub-dark-border rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-bold text-white truncate max-w-[200px]">{group.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${group.is_active ? 'bg-green-950/20 text-green-400 border-green-700/30' : 'bg-red-950/20 text-red-400 border-red-700/30'}`}>
                      {group.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{group.description}</p>
                  <div className="flex gap-4 mt-4 text-xs text-gray-500">
                    <span>👥 {group.member_count} Members</span>
                    <span>📁 {group.hub_resources?.[0]?.count || 0} Files</span>
                    <span>📝 {group.hub_exams?.[0]?.count || 0} Exams</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 border-t border-hub-dark-border/40 pt-4">
                  <button
                    onClick={() => toggleGroupStatus(group.id, group.is_active)}
                    className="text-xs text-gray-500 hover:text-white"
                  >
                    {group.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <Link
                    to={`/hub/groups/${group.id}`}
                    className="text-xs font-semibold text-hub-gold hover:underline flex items-center gap-1"
                  >
                    Manage Content <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
            {groups.length === 0 && (
              <div className="col-span-full p-12 bg-hub-dark-surface/30 border border-dashed border-hub-dark-border rounded-3xl text-center">
                <p className="text-sm text-gray-400 mb-4">You have not created any study groups yet.</p>
                <button onClick={() => setActiveTab('create-group')} className="px-5 py-2.5 bg-hub-gold text-hub-navy font-bold text-sm rounded-xl">
                  Create First Group
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'create-group' && (
          <div className="max-w-xl bg-hub-dark-surface border border-hub-dark-border rounded-3xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Create New Study Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Group Name *</label>
                <input type="text" value={groupForm.name} onChange={e => setGroupForm({...groupForm, name: e.target.value})} placeholder="e.g. UNILAG Math Aspirants 2026" required className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Description</label>
                <textarea value={groupForm.description} onChange={e => setGroupForm({...groupForm, description: e.target.value})} placeholder="Describe group content, mock exams etc." rows={3} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Target University</label>
                <input type="text" value={groupForm.university} onChange={e => setGroupForm({...groupForm, university: e.target.value})} placeholder="e.g. UNILAG" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Subjects (comma-separated)</label>
                <input type="text" value={groupForm.subjects} onChange={e => setGroupForm({...groupForm, subjects: e.target.value})} placeholder="e.g. Mathematics, Physics" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Visibility</label>
                  <select value={groupForm.visibility} onChange={e => setGroupForm({...groupForm, visibility: e.target.value})} className={`${inputClass} appearance-none`}>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="invite_only">Invite Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Join Fee (₦) *</label>
                  <input type="number" value={groupForm.join_fee} onChange={e => setGroupForm({...groupForm, join_fee: Number(e.target.value)})} min={0} required className={inputClass} />
                </div>
              </div>
              <button type="submit" disabled={creatingGroup} className="w-full py-3.5 bg-hub-gold text-hub-navy font-bold text-sm rounded-xl hover:bg-hub-gold-dark flex items-center justify-center gap-2">
                {creatingGroup ? <Loader2 size={16} className="animate-spin" /> : 'Create Group'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-hub-dark-surface border border-hub-dark-border rounded-3xl overflow-hidden">
            <div className="p-5 border-b border-hub-dark-border">
              <h2 className="text-xl font-bold text-white">Active Members</h2>
            </div>
            <div className="divide-y divide-hub-dark-border/40">
              {members.map(m => (
                <div key={m.id} className="p-5 flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h4 className="font-bold text-white text-sm">{m.hub_aspirants?.full_name || 'Aspirant'}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Joined {m.hub_groups?.name}</p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>Access Granted</p>
                    <p className="text-[10px] mt-0.5">Joined {new Date(m.joined_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {members.length === 0 && (
                <div className="p-8 text-center text-gray-500 text-sm">No student memberships found yet.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'finances' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-hub-dark-surface border border-hub-dark-border rounded-3xl">
              <Wallet size={24} className="text-hub-gold mb-3" />
              <h3 className="text-xs font-semibold text-gray-500 uppercase">Payout Balance</h3>
              <div className="text-3xl font-extrabold text-white mt-1">₦{earnings.balance.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-2">After Scolara platform fees (15% commission)</p>
              <button className="mt-6 w-full py-3 bg-hub-gold text-hub-navy font-bold text-sm rounded-xl hover:bg-hub-gold-dark">
                Request Payout
              </button>
            </div>
            <div className="p-6 bg-hub-dark-surface border border-hub-dark-border rounded-3xl">
              <DollarSign size={24} className="text-hub-aqua mb-3" />
              <h3 className="text-xs font-semibold text-gray-500 uppercase">Total Sales</h3>
              <div className="text-3xl font-extrabold text-white mt-1">₦{earnings.totalEarned.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-2">Sum of all student access payments</p>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-xl bg-hub-dark-surface border border-hub-dark-border rounded-3xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Tutor Profile Settings</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Short Bio *</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Introduce yourself, your academic credentials..." rows={4} required className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Subjects You Teach (comma-separated)</label>
                <input type="text" value={subjectsText} onChange={e => setSubjectsText(e.target.value)} placeholder="e.g. Mathematics, Chemistry" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Universities you specialize in (comma-separated)</label>
                <input type="text" value={universitiesText} onChange={e => setUniversitiesText(e.target.value)} placeholder="e.g. UNILAG, UI" className={inputClass} />
              </div>
              <button type="submit" disabled={updatingProfile} className="w-full py-3.5 bg-hub-gold text-hub-navy font-bold text-sm rounded-xl hover:bg-hub-gold-dark flex items-center justify-center gap-2">
                {updatingProfile ? <Loader2 size={16} className="animate-spin" /> : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
