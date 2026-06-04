import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Star, Users, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { TutorCard } from '../../components/hub/TutorCard';
import { useHub } from '../../context/HubContext';

const SUBJECTS = [
  'All', 'Mathematics', 'English', 'Physics', 'Chemistry', 'Biology',
  'Economics', 'Government', 'Literature', 'Agricultural Science', 'Geography',
];

const UNIVERSITIES = [
  'All Universities', 'UNILAG', 'UI', 'ABU', 'OAU', 'UNN',
  'UNIBEN', 'FUTA', 'UNILORIN', 'BUK', 'UNIPORT', 'UNIZIK',
];

export const TutorDirectory: React.FC = () => {
  const { hubUser } = useHub();
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [universityFilter, setUniversityFilter] = useState('All Universities');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [followedTutors, setFollowedTutors] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTutors();
    if (hubUser) fetchFollowedTutors();
  }, [subjectFilter, universityFilter, ratingFilter, hubUser]);

  const fetchTutors = async () => {
    setLoading(true);
    let query = supabase
      .from('hub_tutors')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false });

    if (subjectFilter !== 'All') {
      query = query.contains('subjects', [subjectFilter]);
    }
    if (universityFilter !== 'All Universities') {
      query = query.contains('universities', [universityFilter]);
    }
    if (ratingFilter > 0) {
      query = query.gte('rating', ratingFilter);
    }

    const { data } = await query;
    setTutors(data || []);
    setLoading(false);
  };

  const fetchFollowedTutors = async () => {
    if (!hubUser) return;
    const { data } = await supabase
      .from('hub_tutor_followers')
      .select('tutor_id')
      .eq('follower_id', hubUser.id);
    setFollowedTutors(new Set(data?.map(f => f.tutor_id) || []));
  };

  const handleFollow = async (tutorId: string) => {
    if (!hubUser) { window.location.href = '/hub/login'; return; }
    const isFollowing = followedTutors.has(tutorId);
    if (isFollowing) {
      await supabase.from('hub_tutor_followers').delete()
        .eq('tutor_id', tutorId).eq('follower_id', hubUser.id);
      setFollowedTutors(prev => { const s = new Set(prev); s.delete(tutorId); return s; });
    } else {
      await supabase.from('hub_tutor_followers').insert({ tutor_id: tutorId, follower_id: hubUser.id });
      setFollowedTutors(prev => new Set([...prev, tutorId]));
    }
  };

  const filtered = tutors.filter(t => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.bio?.toLowerCase().includes(q) ||
      t.subjects?.some((s: string) => s.toLowerCase().includes(q)) ||
      t.universities?.some((u: string) => u.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-hub-dark-bg min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-1">Tutor Directory</h1>
          <p className="text-gray-400">Find verified experts to guide your Post-UTME preparation</p>
        </motion.div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by subject, university..."
              className="w-full bg-hub-dark-surface border border-hub-dark-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-hub-gold/40 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 bg-hub-dark-surface border border-hub-dark-border rounded-xl text-sm text-gray-400 hover:text-white hover:border-hub-gold/30 transition-all"
          >
            <SlidersHorizontal size={16} />
            Filters
            {(subjectFilter !== 'All' || universityFilter !== 'All Universities' || ratingFilter > 0) && (
              <span className="w-2 h-2 bg-hub-gold rounded-full" />
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-5 bg-hub-dark-surface border border-hub-dark-border rounded-2xl"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Subject</label>
                <div className="flex flex-wrap gap-1.5">
                  {SUBJECTS.map(s => (
                    <button
                      key={s}
                      onClick={() => setSubjectFilter(s)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                        subjectFilter === s
                          ? 'bg-hub-gold text-hub-navy border-hub-gold font-semibold'
                          : 'bg-hub-dark-bg text-gray-500 border-hub-dark-border hover:border-hub-gold/30'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">University</label>
                <select
                  value={universityFilter}
                  onChange={e => setUniversityFilter(e.target.value)}
                  className="w-full bg-hub-dark-bg border border-hub-dark-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-hub-gold/40"
                >
                  {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  Min Rating: {ratingFilter > 0 ? `${ratingFilter}★` : 'Any'}
                </label>
                <div className="flex gap-2">
                  {[0, 3, 4, 4.5].map(r => (
                    <button
                      key={r}
                      onClick={() => setRatingFilter(r)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border transition-all ${
                        ratingFilter === r
                          ? 'bg-hub-gold text-hub-navy border-hub-gold font-semibold'
                          : 'bg-hub-dark-bg text-gray-500 border-hub-dark-border hover:border-hub-gold/30'
                      }`}
                    >
                      {r === 0 ? 'Any' : <><Star size={10} />{r}+</>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => { setSubjectFilter('All'); setUniversityFilter('All Universities'); setRatingFilter(0); }}
              className="mt-4 text-xs text-gray-500 hover:text-hub-gold transition-colors"
            >
              Clear all filters
            </button>
          </motion.div>
        )}

        {/* Subject quick filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {SUBJECTS.slice(0, 8).map(s => (
            <button
              key={s}
              onClick={() => setSubjectFilter(s)}
              className={`flex-shrink-0 px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all ${
                subjectFilter === s
                  ? 'bg-hub-gold text-hub-navy border-hub-gold'
                  : 'bg-hub-dark-surface text-gray-400 border-hub-dark-border hover:border-hub-gold/30'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {loading ? 'Loading...' : `${filtered.length} tutor${filtered.length !== 1 ? 's' : ''} found`}
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Users size={12} />
            {tutors.reduce((a, t) => a + (t.students_count || 0), 0).toLocaleString()} total students
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-72 bg-hub-dark-surface border border-hub-dark-border rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">👨‍🏫</div>
            <p className="text-white font-semibold mb-1">No tutors found</p>
            <p className="text-sm text-gray-500">Try a different search or filter</p>
            <button onClick={() => { setSearch(''); setSubjectFilter('All'); setUniversityFilter('All Universities'); setRatingFilter(0); }}
              className="mt-4 text-hub-gold text-sm hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((tutor, i) => (
              <motion.div
                key={tutor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <TutorCard
                  {...tutor}
                  name={tutor.bio?.split('.')[0] || `Tutor ${i + 1}`}
                  universities={tutor.universities}
                  isFollowing={followedTutors.has(tutor.id)}
                  onFollow={() => handleFollow(tutor.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
