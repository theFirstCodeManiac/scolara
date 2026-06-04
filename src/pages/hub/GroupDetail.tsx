import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
// motion removed - unused
import {
  MessageSquare, BookOpen, Zap, Megaphone, Users, Settings,
  ArrowLeft, Lock, Crown, BadgeCheck, Share2, UserPlus
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useHub } from '../../context/HubContext';
import { PaystackModal } from '../../components/hub/PaystackModal';
import { GroupChat } from './GroupChat';
import { ResourcesPage } from './ResourcesPage';
import { ExamsList } from './ExamsList';
import { AnnouncementsPage } from './AnnouncementsPage';

type Tab = 'chat' | 'resources' | 'exams' | 'announcements' | 'members';

export const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { hubUser } = useHub();
  const navigate = useNavigate();

  const [group, setGroup] = useState<any>(null);
  const [tutor, setTutor] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [membership, setMembership] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('announcements');
  const [payModal, setPayModal] = useState(false);
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    if (id) fetchGroupData();
  }, [id, hubUser]);

  const fetchGroupData = async () => {
    setLoading(true);
    // Group info
    const { data: groupData } = await supabase
      .from('hub_groups')
      .select('*, hub_tutors(*)')
      .eq('id', id)
      .single();

    if (!groupData) { navigate('/hub/groups'); return; }
    setGroup(groupData);
    setTutor(groupData.hub_tutors);
    setMemberCount(groupData.member_count || 0);

    // Members list
    const { data: membersData } = await supabase
      .from('hub_group_members')
      .select('*, hub_aspirants(full_name, avatar_url)')
      .eq('group_id', id)
      .eq('payment_status', 'paid')
      .order('joined_at', { ascending: false })
      .limit(50);
    setMembers(membersData || []);

    // Own membership
    if (hubUser) {
      const { data: mem } = await supabase
        .from('hub_group_members')
        .select('*')
        .eq('group_id', id)
        .eq('user_id', hubUser.id)
        .single();
      setMembership(mem);
    }
    setLoading(false);
  };

  const hasAccess = membership?.payment_status === 'paid' ||
    hubUser?.role === 'hub_tutor' ||
    tutor?.user_id === hubUser?.id;

  const isTutor = tutor?.user_id === hubUser?.id;

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/hub/groups/${id}?invite=${group?.invite_token}`);
    alert('Invite link copied!');
  };

  if (loading) {
    return (
      <div className="bg-hub-dark-bg min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-hub-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'announcements', label: 'Updates', icon: <Megaphone size={15} /> },
    { key: 'chat', label: 'Chat', icon: <MessageSquare size={15} /> },
    { key: 'resources', label: 'Resources', icon: <BookOpen size={15} /> },
    { key: 'exams', label: 'Exams', icon: <Zap size={15} /> },
    { key: 'members', label: `Members (${memberCount})`, icon: <Users size={15} /> },
  ];

  return (
    <div className="bg-hub-dark-bg min-h-screen flex flex-col">
      {/* Group Header */}
      <div className="relative">
        {/* Cover */}
        <div className="h-40 md:h-52 bg-gradient-to-br from-hub-navy via-hub-aqua-dark to-hub-navy relative overflow-hidden">
          {group.cover_url ? (
            <img src={group.cover_url} alt={group.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[80px] font-extrabold text-white/5">
                {group.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-hub-dark-bg via-hub-dark-bg/40 to-transparent" />

          {/* Back button */}
          <button
            onClick={() => navigate('/hub/groups')}
            className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-hub-dark-bg/70 backdrop-blur-sm border border-hub-dark-border text-sm text-gray-300 rounded-xl hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>

          {/* Actions */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={copyInviteLink}
              className="p-2 bg-hub-dark-bg/70 backdrop-blur-sm border border-hub-dark-border rounded-xl text-gray-400 hover:text-white transition-colors"
            >
              <Share2 size={15} />
            </button>
            {isTutor && (
              <Link
                to={`/hub/tutor-panel?group=${id}`}
                className="p-2 bg-hub-dark-bg/70 backdrop-blur-sm border border-hub-dark-border rounded-xl text-gray-400 hover:text-white transition-colors"
              >
                <Settings size={15} />
              </Link>
            )}
          </div>
        </div>

        {/* Group Info */}
        <div className="px-4 md:px-8 pb-4 -mt-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Group avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-hub-gold to-hub-aqua border-4 border-hub-dark-bg flex items-center justify-center text-hub-navy font-extrabold text-2xl shadow-xl flex-shrink-0">
              {group.name.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold text-white">{group.name}</h1>
                {group.visibility !== 'public' && (
                  <span className="flex items-center gap-1 text-[11px] bg-hub-dark-surface border border-hub-dark-border px-2 py-0.5 rounded-full text-gray-400">
                    <Lock size={10} /> {group.visibility === 'private' ? 'Private' : 'Invite Only'}
                  </span>
                )}
              </div>
              {group.university && (
                <p className="text-hub-aqua text-sm mt-0.5">{group.university}</p>
              )}
              {group.description && (
                <p className="text-gray-400 text-sm mt-1 line-clamp-2">{group.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Users size={11} className="text-hub-aqua" /> {memberCount} members</span>
                {tutor && (
                  <span className="flex items-center gap-1">
                    <Crown size={11} className="text-hub-gold" />
                    <span className="text-gray-400">by</span>
                    <span className="text-white">{tutor.is_verified && <BadgeCheck size={11} className="inline text-hub-aqua" />} Tutor</span>
                  </span>
                )}
                {group.subjects?.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {group.subjects.slice(0, 3).map((s: string) => (
                      <span key={s} className="px-2 py-0.5 bg-hub-navy border border-hub-gold/15 text-hub-gold text-[10px] rounded-full">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Join/Access Button */}
            <div className="flex-shrink-0">
              {!hubUser ? (
                <Link to={`/hub/login?redirect=/hub/groups/${id}`} className="px-5 py-2.5 bg-hub-gold text-hub-navy font-bold text-sm rounded-xl">
                  Sign In to Join
                </Link>
              ) : hasAccess ? (
                <div className="flex items-center gap-1.5 px-4 py-2 bg-green-900/20 border border-green-700/30 text-green-400 rounded-xl text-sm font-medium">
                  <BadgeCheck size={15} /> Member
                </div>
              ) : (
                <button
                  onClick={() => setPayModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-hub-gold text-hub-navy font-bold text-sm rounded-xl hover:bg-hub-gold-dark transition-all shadow-lg shadow-hub-gold/20"
                >
                  <UserPlus size={15} /> Join — ₦{group.join_fee_naira?.toLocaleString() || '500'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-hub-dark-border bg-hub-dark-bg sticky top-0 z-10 px-4 md:px-8">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              disabled={!hasAccess && tab.key !== 'announcements'}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
                activeTab === tab.key
                  ? 'border-hub-gold text-hub-gold'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
              {!hasAccess && tab.key !== 'announcements' && (
                <Lock size={11} className="text-gray-700" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {/* Lock gate for non-members */}
        {!hasAccess && activeTab !== 'announcements' ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-hub-dark-surface border border-hub-dark-border flex items-center justify-center mb-4">
              <Lock size={28} className="text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Members Only</h3>
            <p className="text-sm text-gray-400 max-w-sm mb-6">
              Join this group to access {activeTab}, chat with members, and take mock exams.
            </p>
            <button
              onClick={() => setPayModal(true)}
              className="px-6 py-3 bg-hub-gold text-hub-navy font-bold rounded-xl hover:bg-hub-gold-dark transition-all shadow-lg shadow-hub-gold/20"
            >
              Join for ₦{group.join_fee_naira?.toLocaleString() || '500'}
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'announcements' && id && <AnnouncementsPage groupId={id} isTutor={isTutor} hasAccess={hasAccess} />}
            {activeTab === 'chat' && id && hasAccess && <GroupChat groupId={id} groupName={group.name} />}
            {activeTab === 'resources' && id && hasAccess && <ResourcesPage groupId={id} isTutor={isTutor} />}
            {activeTab === 'exams' && id && hasAccess && <ExamsList groupId={id} isTutor={isTutor} />}
            {activeTab === 'members' && (
              <div className="p-4 md:p-8 max-w-3xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Tutor */}
                  {tutor && (
                    <div className="flex items-center gap-3 p-4 bg-hub-dark-surface border border-hub-gold/20 rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-hub-gold to-hub-aqua flex items-center justify-center text-hub-navy font-bold text-sm">T</div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-semibold text-white">Tutor</span>
                          <Crown size={12} className="text-hub-gold" />
                        </div>
                        <span className="text-[11px] text-hub-gold">Group Admin</span>
                      </div>
                    </div>
                  )}
                  {members.map(member => (
                    <div key={member.id} className="flex items-center gap-3 p-4 bg-hub-dark-surface border border-hub-dark-border rounded-xl hover:border-hub-dark-border/60 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-hub-navy flex items-center justify-center text-hub-gold font-bold text-sm">
                        {member.hub_aspirants?.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{member.hub_aspirants?.full_name || 'Member'}</p>
                        <p className="text-[11px] text-gray-500">Joined {new Date(member.joined_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Payment Modal */}
      {payModal && (
        <PaystackModal
          isOpen={payModal}
          onClose={() => setPayModal(false)}
          groupId={id!}
          groupName={group.name}
          onSuccess={() => {
            setMembership({ payment_status: 'paid' });
            setMemberCount(prev => prev + 1);
          }}
        />
      )}
    </div>
  );
};
