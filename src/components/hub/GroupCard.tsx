import React from 'react';
import { Users, Lock, Globe, KeyRound, BookOpen, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface GroupCardProps {
  id: string;
  name: string;
  description?: string;
  cover_url?: string;
  university?: string;
  subjects?: string[];
  visibility?: 'public' | 'private' | 'invite_only';
  member_count?: number;
  join_fee_naira?: number;
  tutor_name?: string;
  tutor_avatar?: string;
  is_joined?: boolean;
  exam_count?: number;
  resource_count?: number;
  onJoin?: () => void;
}

const VisibilityIcon: Record<string, React.ReactNode> = {
  public: <Globe size={12} />,
  private: <Lock size={12} />,
  invite_only: <KeyRound size={12} />,
};

const VisibilityLabel: Record<string, string> = {
  public: 'Public',
  private: 'Private',
  invite_only: 'Invite Only',
};

export const GroupCard: React.FC<GroupCardProps> = ({
  id, name, description, cover_url, university, subjects = [],
  visibility = 'public', member_count = 0, join_fee_naira = 500,
  tutor_name, is_joined, exam_count = 0, resource_count = 0,
  onJoin,
}) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 16px 36px rgba(0,0,0,0.3)' }}
      transition={{ duration: 0.2 }}
      className="bg-hub-dark-surface border border-hub-dark-border rounded-2xl overflow-hidden hover:border-hub-aqua/40 transition-colors"
    >
      {/* Cover */}
      <div className="relative h-32 bg-gradient-to-br from-hub-navy to-hub-aqua-dark overflow-hidden">
        {cover_url ? (
          <img src={cover_url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-extrabold text-white/20">{initials}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-hub-dark-surface/80 to-transparent" />

        {/* Visibility badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-hub-dark-bg/70 backdrop-blur-sm text-[10px] text-gray-300 border border-hub-dark-border">
          {VisibilityIcon[visibility]}
          {VisibilityLabel[visibility]}
        </div>

        {/* Joined badge */}
        {is_joined && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-hub-gold text-hub-navy text-[10px] font-bold">
            ✓ Joined
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3">
        {/* Title & University */}
        <div>
          <h3 className="font-bold text-white text-sm leading-tight">{name}</h3>
          {university && (
            <p className="text-[11px] text-hub-aqua mt-0.5">{university}</p>
          )}
        </div>

        {description && (
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{description}</p>
        )}

        {/* Subjects */}
        {subjects.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {subjects.slice(0, 3).map(s => (
              <span key={s} className="px-1.5 py-0.5 bg-hub-navy text-hub-gold text-[10px] rounded-md border border-hub-gold/15">
                {s}
              </span>
            ))}
            {subjects.length > 3 && (
              <span className="px-1.5 py-0.5 bg-hub-dark-border text-gray-500 text-[10px] rounded-md">+{subjects.length - 3}</span>
            )}
          </div>
        )}

        {/* Tutor */}
        {tutor_name && (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-hub-gold flex items-center justify-center text-hub-navy text-[9px] font-bold">
              {tutor_name.charAt(0)}
            </div>
            <span className="text-[11px] text-gray-400">by <span className="text-gray-300">{tutor_name}</span></span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 text-[11px] text-gray-500">
          <div className="flex items-center gap-1">
            <Users size={11} className="text-hub-aqua" />
            {member_count.toLocaleString()} members
          </div>
          <div className="flex items-center gap-1">
            <Zap size={11} className="text-hub-gold" />
            {exam_count} exams
          </div>
          <div className="flex items-center gap-1">
            <BookOpen size={11} className="text-gray-500" />
            {resource_count} files
          </div>
        </div>

        {/* Action */}
        {is_joined ? (
          <Link
            to={`/hub/groups/${id}`}
            className="w-full text-center py-2.5 rounded-xl bg-hub-aqua/10 text-hub-aqua text-sm font-semibold border border-hub-aqua/25 hover:bg-hub-aqua hover:text-white transition-all"
          >
            Enter Group →
          </Link>
        ) : (
          <button
            onClick={onJoin}
            className="w-full py-2.5 rounded-xl bg-hub-gold text-hub-navy text-sm font-bold hover:bg-hub-gold-dark transition-all shadow-lg shadow-hub-gold/20 active:scale-95"
          >
            Join — ₦{join_fee_naira?.toLocaleString() || '500'}
          </button>
        )}
      </div>
    </motion.div>
  );
};
