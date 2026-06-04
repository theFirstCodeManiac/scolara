import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, BookOpen, Users, Zap, Trophy, Star, ArrowRight,
  CheckCircle, Sparkles, TrendingUp, Shield, Play, ChevronRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useHub } from '../../context/HubContext';

const STATS = [
  { label: 'Active Aspirants', value: '12,500+', icon: Users, color: 'text-hub-gold' },
  { label: 'Study Groups', value: '240+', icon: BookOpen, color: 'text-hub-aqua' },
  { label: 'Mock Exams Taken', value: '85,000+', icon: Zap, color: 'text-hub-gold' },
  { label: 'Success Rate', value: '94%', icon: Trophy, color: 'text-hub-aqua' },
];

const FEATURES = [
  {
    icon: BookOpen, title: 'Past Questions Library',
    desc: 'Access thousands of curated past questions from top universities across Nigeria.',
    color: 'from-hub-gold/20 to-hub-gold/5', border: 'border-hub-gold/20',
  },
  {
    icon: Zap, title: 'Live Mock Exams',
    desc: 'Timed mock examinations with instant grading, explanations, and performance analytics.',
    color: 'from-hub-aqua/20 to-hub-aqua/5', border: 'border-hub-aqua/20',
  },
  {
    icon: Users, title: 'Study Communities',
    desc: 'Join expert-led groups, chat with fellow aspirants, and collaborate in real-time.',
    color: 'from-hub-navy/60 to-hub-navy/30', border: 'border-hub-dark-border',
  },
  {
    icon: Sparkles, title: 'Scolara AI Coach',
    desc: 'AI-powered study plans, weak topic analysis, and personalized recommendations.',
    color: 'from-purple-900/30 to-purple-900/10', border: 'border-purple-700/20',
  },
  {
    icon: TrendingUp, title: 'Progress Tracking',
    desc: 'Track your scores, monitor improvement, and compete on the leaderboard.',
    color: 'from-green-900/30 to-green-900/10', border: 'border-green-700/20',
  },
  {
    icon: Shield, title: 'Expert Tutors',
    desc: 'Learn from verified tutors with proven UTME preparation experience.',
    color: 'from-hub-gold/15 to-transparent', border: 'border-hub-gold/15',
  },
];

const SUBJECTS = ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Government', 'Literature'];

export const HubHome: React.FC = () => {
  const { hubUser } = useHub();
  const navigate = useNavigate();
  const [_featuredGroups, setFeaturedGroups] = useState<any[]>([]);
  const [featuredTutors, setFeaturedTutors] = useState<any[]>([]);

  useEffect(() => {
    fetchFeaturedData();
  }, []);

  const fetchFeaturedData = async () => {
    const { data: groups } = await supabase
      .from('hub_groups')
      .select('*, hub_tutors(user_id)')
      .eq('visibility', 'public')
      .eq('is_active', true)
      .order('member_count', { ascending: false })
      .limit(6);

    const { data: tutors } = await supabase
      .from('hub_tutors')
      .select('*')
      .eq('is_verified', true)
      .eq('is_active', true)
      .order('rating', { ascending: false })
      .limit(4);

    setFeaturedGroups(groups || []);
    setFeaturedTutors(tutors || []);
  };

  const fadeUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  return (
    <div className="bg-hub-dark-bg min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-hub-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-hub-aqua/5 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMTM0NTMiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMTBoMnYyMHptMCAwaDIwdjJIMzZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
          <motion.div className="text-center max-w-4xl mx-auto" {...fadeUp}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-hub-gold/10 border border-hub-gold/25 rounded-full text-hub-gold text-sm font-semibold mb-6">
              <GraduationCap size={16} />
              Nigeria's #1 Post-UTME Preparation Platform
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
              Crack the{' '}
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-hub-gold to-hub-aqua">Post-UTME</span>
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-hub-gold to-hub-aqua rounded-full opacity-60" />
              </span>
              {' '}with confidence
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              Join expert-led study communities, take mock exams, access past questions, and get AI-powered coaching — all in one place.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {hubUser ? (
                <>
                  <Link
                    to="/hub/groups"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-hub-gold text-hub-navy font-bold text-base rounded-xl hover:bg-hub-gold-dark transition-all shadow-xl shadow-hub-gold/25 active:scale-95"
                  >
                    Browse Groups <ArrowRight size={18} />
                  </Link>
                  <Link
                    to="/hub/student"
                    className="inline-flex items-center gap-2 px-8 py-4 border border-hub-aqua/40 text-hub-aqua font-semibold text-base rounded-xl hover:bg-hub-aqua/10 transition-all"
                  >
                    My Dashboard <ChevronRight size={18} />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/hub/register"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-hub-gold text-hub-navy font-bold text-base rounded-xl hover:bg-hub-gold-dark transition-all shadow-xl shadow-hub-gold/25 active:scale-95"
                  >
                    Get Started Free <ArrowRight size={18} />
                  </Link>
                  <Link
                    to="/hub/tutors"
                    className="inline-flex items-center gap-2 px-8 py-4 border border-hub-dark-border text-gray-300 font-semibold text-base rounded-xl hover:bg-hub-dark-surface transition-all"
                  >
                    <Play size={16} /> Browse Tutors
                  </Link>
                </>
              )}
            </div>
          </motion.div>

          {/* Subject chips */}
          <motion.div
            className="flex flex-wrap justify-center gap-2 mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {SUBJECTS.map((s, i) => (
              <motion.button
                key={s}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                onClick={() => navigate(`/hub/tutors?subject=${s}`)}
                className="px-4 py-1.5 bg-hub-dark-surface border border-hub-dark-border text-sm text-gray-400 rounded-full hover:border-hub-gold/40 hover:text-hub-gold transition-all cursor-pointer"
              >
                {s}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-hub-dark-border bg-hub-dark-surface/30">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <Icon size={24} className={`${stat.color} mx-auto mb-2`} />
                  <div className={`text-3xl font-extrabold ${stat.color} mb-1`}>{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Everything you need to succeed</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Built for Nigerian Post-UTME aspirants by educators who understand the exam.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className={`p-6 rounded-2xl bg-gradient-to-b ${f.color} border ${f.border} backdrop-blur-sm`}
              >
                <div className="w-10 h-10 rounded-xl bg-hub-dark-bg/60 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-hub-gold" />
                </div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Featured Tutors */}
      {featuredTutors.length > 0 && (
        <section className="py-16 bg-hub-dark-surface/20 border-y border-hub-dark-border">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-white">Top Tutors</h2>
                <p className="text-sm text-gray-500">Verified experts ready to guide you</p>
              </div>
              <Link to="/hub/tutors" className="text-hub-gold text-sm font-semibold hover:underline flex items-center gap-1">
                See all <ChevronRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredTutors.map((tutor) => (
                <Link key={tutor.id} to={`/hub/tutors/${tutor.id}`}>
                  <div className="p-4 bg-hub-dark-surface border border-hub-dark-border rounded-2xl hover:border-hub-gold/30 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-hub-gold to-hub-aqua flex items-center justify-center text-hub-navy font-bold text-lg mb-3 mx-auto">
                      T
                    </div>
                    <p className="text-sm font-bold text-white text-center truncate">Tutor</p>
                    <div className="flex justify-center gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} className={i < Math.round(tutor.rating || 0) ? 'text-hub-gold fill-hub-gold' : 'text-gray-700'} />
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-500 text-center mt-1">{tutor.students_count || 0} students</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it Works */}
      <section className="py-20 max-w-4xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white mb-3">Get started in 3 steps</h2>
          <p className="text-gray-400">Simple, fast, and built for aspirants.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Create your account', desc: 'Sign up as an aspirant in under 60 seconds. No payment needed upfront.' },
            { step: '02', title: 'Join a study group', desc: 'Browse tutor-led groups by university and subjects. Pay ₦500 once for unlimited access.' },
            { step: '03', title: 'Study & Excel', desc: 'Take mock exams, access resources, chat with peers, and track your growth.' },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative text-center p-6"
            >
              <div className="text-6xl font-extrabold text-hub-dark-border mb-4">{item.step}</div>
              <h3 className="font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.desc}</p>
              {i < 2 && (
                <div className="hidden md:block absolute top-10 -right-3 text-hub-dark-border">
                  <ChevronRight size={24} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-hub-navy to-hub-aqua-dark rounded-3xl p-10 text-center border border-hub-aqua/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(244,211,94,0.1),transparent_70%)]" />
          <div className="relative">
            <GraduationCap size={40} className="text-hub-gold mx-auto mb-4" />
            <h2 className="text-3xl font-extrabold text-white mb-3">Ready to crack your Post-UTME?</h2>
            <p className="text-hub-aqua-light mb-6 max-w-lg mx-auto">
              Join thousands of Nigerian aspirants who are preparing smarter with Scolara Post-UTME Hub.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/hub/register"
                className="px-8 py-3.5 bg-hub-gold text-hub-navy font-bold rounded-xl hover:bg-hub-gold-dark transition-all shadow-lg shadow-hub-gold/20"
              >
                Start Free Today
              </Link>
              <Link
                to="/hub/tutors"
                className="px-8 py-3.5 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
              >
                Browse Tutors
              </Link>
            </div>
            <div className="flex items-center justify-center gap-4 mt-6">
              {['Free to register', '₦500 group access', 'Unlimited resources'].map(f => (
                <div key={f} className="flex items-center gap-1.5 text-xs text-hub-aqua-light">
                  <CheckCircle size={12} className="text-hub-gold" /> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
