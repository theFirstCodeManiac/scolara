import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Plus, Grid3X3, List,
  TrendingUp
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { GroupCard } from '../../components/hub/GroupCard';
import { PaystackModal } from '../../components/hub/PaystackModal';
import { useHub } from '../../context/HubContext';

const UNIVERSITIES = [
  'All', 'UNILAG', 'UI', 'ABU', 'OAU', 'UNN', 'UNIBEN',
  'FUTA', 'UNILORIN', 'BUK', 'UNIPORT', 'UNIZIK',
];

export const GroupsExplore: React.FC = () => {
  const { hubUser } = useHub();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<any[]>([]);
  const [myGroups, setMyGroups] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [universityFilter, setUniversityFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'joined' | 'popular'>('all');
  const [payModal, setPayModal] = useState<{ groupId: string; groupName: string } | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('hub_groups')
      .select(`
        *,
        hub_tutors(id, user_id, bio, subjects, is_verified),
        hub_resources(count),
        hub_exams(count)
      `)
      .eq('is_active', true)
      .eq('visibility', 'public');

    if (universityFilter !== 'All') {
      query = query.ilike('university', `%${universityFilter}%`);
    }
    if (activeTab === 'popular') {
      query = query.order('member_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data } = await query.limit(48);
    setGroups(data || []);

    // Fetch user's joined groups
    if (hubUser) {
      const { data: memberships } = await supabase
        .from('hub_group_members')
        .select('group_id')
        .eq('user_id', hubUser.id)
        .eq('payment_status', 'paid');
      setMyGroups(new Set(memberships?.map(m => m.group_id) || []));
    }
    setLoading(false);
  }, [universityFilter, activeTab, hubUser]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const handleJoin = (groupId: string, groupName: string) => {
    if (!hubUser) {
      navigate(`/hub/login?redirect=/hub/groups`);
      return;
    }
    setPayModal({ groupId, groupName });
  };

  const filtered = groups.filter(g => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return g.name?.toLowerCase().includes(q) ||
      g.description?.toLowerCase().includes(q) ||
      g.university?.toLowerCase().includes(q);
  });

  const isTutor = hubUser?.role === 'hub_tutor';

  return (
    <div className="bg-hub-dark-bg min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-extrabold text-white mb-1">Study Groups</h1>
            <p className="text-gray-400">Join expert-led communities and prepare together</p>
          </motion.div>
          {isTutor && (
            <Link
              to="/hub/tutor-panel?tab=create-group"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-hub-gold text-hub-navy font-bold text-sm rounded-xl hover:bg-hub-gold-dark transition-all shadow-lg shadow-hub-gold/20"
            >
              <Plus size={16} /> Create Group
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-hub-dark-surface border border-hub-dark-border rounded-xl w-fit">
          {(['all', 'popular', ...(hubUser ? ['joined'] : [])] as string[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? 'bg-hub-gold text-hub-navy font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'all' ? '🌐 All Groups' : tab === 'popular' ? '🔥 Popular' : '📚 My Groups'}
            </button>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search groups..."
              className="w-full bg-hub-dark-surface border border-hub-dark-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-hub-gold/40"
            />
          </div>

          {/* University quick filter */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {UNIVERSITIES.slice(0, 6).map(u => (
              <button
                key={u}
                onClick={() => setUniversityFilter(u)}
                className={`flex-shrink-0 px-3 py-2.5 text-xs font-medium rounded-xl border transition-all ${
                  universityFilter === u
                    ? 'bg-hub-aqua text-white border-hub-aqua'
                    : 'bg-hub-dark-surface text-gray-400 border-hub-dark-border hover:border-hub-aqua/30'
                }`}
              >
                {u}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex gap-1 p-1 bg-hub-dark-surface border border-hub-dark-border rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-hub-dark-border text-white' : 'text-gray-600'}`}
            >
              <Grid3X3 size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-hub-dark-border text-white' : 'text-gray-600'}`}
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {loading ? 'Loading...' : `${filtered.length} group${filtered.length !== 1 ? 's' : ''}`}
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <TrendingUp size={12} className="text-hub-gold" />
            <span>Join for ₦500 one-time</span>
          </div>
        </div>

        {/* Groups Grid/List */}
        {loading ? (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-72 bg-hub-dark-surface border border-hub-dark-border rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">📚</div>
            <p className="text-white font-semibold mb-1">No groups found</p>
            <p className="text-sm text-gray-500 mb-4">
              {activeTab === 'joined' ? "You haven't joined any groups yet." : 'Try a different search.'}
            </p>
            {activeTab === 'joined' && (
              <button onClick={() => setActiveTab('all')} className="text-hub-gold text-sm hover:underline">
                Browse all groups
              </button>
            )}
          </div>
        ) : (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-2xl'}`}>
            {filtered.map((group, i) => {
              const isJoined = myGroups.has(group.id);
              const tutorBio = group.hub_tutors?.bio;
              return (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <GroupCard
                    id={group.id}
                    name={group.name}
                    description={group.description}
                    cover_url={group.cover_url}
                    university={group.university}
                    subjects={group.subjects}
                    visibility={group.visibility}
                    member_count={group.member_count}
                    join_fee_naira={group.join_fee_naira}
                    tutor_name={tutorBio?.split(' ')[0] || 'Tutor'}
                    is_joined={isJoined}
                    exam_count={group.hub_exams?.[0]?.count || 0}
                    resource_count={group.hub_resources?.[0]?.count || 0}
                    onJoin={() => handleJoin(group.id, group.name)}
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Payment Modal */}
        {payModal && (
          <PaystackModal
            isOpen={!!payModal}
            onClose={() => setPayModal(null)}
            groupId={payModal.groupId}
            groupName={payModal.groupName}
            onSuccess={() => {
              setMyGroups(prev => new Set([...prev, payModal.groupId]));
              navigate(`/hub/groups/${payModal.groupId}`);
            }}
          />
        )}
      </div>
    </div>
  );
};
