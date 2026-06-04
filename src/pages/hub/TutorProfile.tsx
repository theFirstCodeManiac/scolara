import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Users, BadgeCheck, MessageSquare, ArrowLeft, Heart } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useHub } from '../../context/HubContext';
import { GroupCard } from '../../components/hub/GroupCard';

export const TutorProfile: React.FC = () => {
  const { tutorId } = useParams<{ tutorId: string }>();
  const { hubUser } = useHub();
  const navigate = useNavigate();

  const [tutor, setTutor] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tutorId) {
      fetchTutorProfile();
    }
  }, [tutorId, hubUser]);

  const fetchTutorProfile = async () => {
    setLoading(true);

    const { data: tutorData } = await supabase
      .from('hub_tutors')
      .select('*')
      .eq('id', tutorId)
      .single();

    if (!tutorData) {
      navigate('/hub/tutors');
      return;
    }
    setTutor(tutorData);
    setFollowersCount(tutorData.followers_count || 0);

    // Fetch tutor's groups
    const { data: groupsData } = await supabase
      .from('hub_groups')
      .select(`
        *,
        hub_resources(count),
        hub_exams(count)
      `)
      .eq('tutor_id', tutorId)
      .eq('is_active', true)
      .eq('visibility', 'public');
    setGroups(groupsData || []);

    // Check if following
    if (hubUser) {
      const { data: follow } = await supabase
        .from('hub_tutor_followers')
        .select('*')
        .eq('tutor_id', tutorId)
        .eq('follower_id', hubUser.id)
        .single();
      setIsFollowing(!!follow);
    }
    setLoading(false);
  };

  const handleFollow = async () => {
    if (!hubUser) {
      navigate('/hub/login');
      return;
    }

    if (isFollowing) {
      await supabase
        .from('hub_tutor_followers')
        .delete()
        .eq('tutor_id', tutorId)
        .eq('follower_id', hubUser.id);
      setIsFollowing(false);
      setFollowersCount(prev => Math.max(0, prev - 1));
    } else {
      await supabase
        .from('hub_tutor_followers')
        .insert({ tutor_id: tutorId, follower_id: hubUser.id });
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="bg-hub-dark-bg min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-hub-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const name = tutor.bio?.split('.')[0] || 'Verified Tutor';
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="bg-hub-dark-bg min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/hub/tutors" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-white mb-6">
          <ArrowLeft size={15} /> Back to Tutors
        </Link>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-hub-dark-surface border border-hub-dark-border rounded-3xl p-6 md:p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-hub-gold to-hub-aqua flex items-center justify-center text-hub-navy font-extrabold text-3xl shadow-xl flex-shrink-0">
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                <h1 className="text-2xl font-extrabold text-white flex items-center gap-1.5 justify-center sm:justify-start">
                  {name}
                  {tutor.is_verified && <BadgeCheck size={22} className="text-hub-aqua" />}
                </h1>
                <div className="flex gap-2 justify-center mt-2 sm:mt-0">
                  <button
                    onClick={handleFollow}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      isFollowing
                        ? 'bg-hub-gold/10 border-hub-gold text-hub-gold'
                        : 'bg-hub-dark-bg border-hub-dark-border text-gray-400 hover:text-white'
                    }`}
                  >
                    <Heart size={14} className={isFollowing ? 'fill-hub-gold text-hub-gold' : ''} />
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <Link
                    to={`/hub/chat?dm=${tutor.user_id}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-hub-gold text-hub-navy font-bold text-xs rounded-xl hover:bg-hub-gold-dark transition-all"
                  >
                    <MessageSquare size={14} /> Send DM
                  </Link>
                </div>
              </div>

              {/* Bio & Details */}
              <p className="text-sm text-gray-400 mt-3 leading-relaxed">
                {tutor.bio || 'Expert university entrance examination coach guiding aspirants to top scores.'}
              </p>

              <div className="flex flex-wrap gap-4 mt-6 justify-center sm:justify-start">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Star size={14} className="text-hub-gold fill-hub-gold" />
                  <span className="font-bold text-white">{(tutor.rating || 5).toFixed(1)} Rating</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Users size={14} className="text-hub-aqua" />
                  <span className="font-bold text-white">{(tutor.students_count || 0).toLocaleString()} Students</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Heart size={14} className="text-red-400" />
                  <span className="font-bold text-white">{followersCount} Followers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subjects & Universities tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-hub-dark-border/40">
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Subject Specialities</h4>
              <div className="flex flex-wrap gap-1.5">
                {tutor.subjects?.map((s: string) => (
                  <span key={s} className="px-2.5 py-1 bg-hub-navy/50 text-hub-gold text-xs rounded-full border border-hub-gold/15">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Target Universities</h4>
              <div className="flex flex-wrap gap-1.5">
                {tutor.universities?.map((u: string) => (
                  <span key={u} className="px-2.5 py-1 bg-hub-dark-bg text-hub-aqua text-xs rounded-full border border-hub-dark-border">
                    {u}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Groups Created */}
        <h2 className="text-xl font-bold text-white mb-4">Study Groups Managed</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {groups.map(group => (
            <GroupCard
              key={group.id}
              id={group.id}
              name={group.name}
              description={group.description}
              cover_url={group.cover_url}
              university={group.university}
              subjects={group.subjects}
              visibility={group.visibility}
              member_count={group.member_count}
              join_fee_naira={group.join_fee_naira}
              tutor_name={name}
              is_joined={false}
              exam_count={group.hub_exams?.[0]?.count || 0}
              resource_count={group.hub_resources?.[0]?.count || 0}
              onJoin={() => {}}
            />
          ))}
          {groups.length === 0 && (
            <div className="col-span-full p-8 bg-hub-dark-surface/30 border border-dashed border-hub-dark-border rounded-2xl text-center text-gray-500">
              No active study groups listed for this tutor.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
