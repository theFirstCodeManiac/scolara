import React from 'react';
import { Star, Users, BookOpen, MapPin, BadgeCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface TutorCardProps {
  id: string;
  name: string;
  bio?: string;
  subjects?: string[];
  universities?: string[];
  experience_years?: number;
  rating?: number;
  students_count?: number;
  followers_count?: number;
  avatar_url?: string;
  is_verified?: boolean;
  activeGroups?: number;
  onFollow?: () => void;
  isFollowing?: boolean;
}

export const TutorCard: React.FC<TutorCardProps> = ({
  id, name, bio, subjects = [], universities = [], experience_years = 0,
  rating = 0, students_count = 0, avatar_url, is_verified, activeGroups = 0,
  onFollow, isFollowing,
}) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
      transition={{ duration: 0.2 }}
      className="bg-hub-dark-surface border border-hub-dark-border rounded-2xl p-5 flex flex-col gap-4 hover:border-hub-gold/30 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          {avatar_url ? (
            <img src={avatar_url} alt={name} className="w-14 h-14 rounded-2xl object-cover border-2 border-hub-dark-border" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-hub-gold to-hub-aqua flex items-center justify-center text-hub-navy font-extrabold text-lg">
              {initials}
            </div>
          )}
          {is_verified && (
            <div className="absolute -bottom-1 -right-1 bg-hub-aqua rounded-full p-0.5">
              <BadgeCheck size={14} className="text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-sm truncate">{name}</h3>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={11} className={i < Math.round(rating) ? 'text-hub-gold fill-hub-gold' : 'text-gray-700'} />
            ))}
            <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
          </div>
          {experience_years > 0 && (
            <span className="text-[11px] text-hub-aqua">{experience_years}yr{experience_years !== 1 ? 's' : ''} experience</span>
          )}
        </div>
        <button
          onClick={onFollow}
          className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isFollowing
              ? 'bg-hub-gold/10 text-hub-gold border border-hub-gold/30'
              : 'bg-hub-dark-border text-gray-400 hover:bg-hub-gold hover:text-hub-navy border border-transparent'
          }`}
        >
          <Heart size={12} className={isFollowing ? 'fill-hub-gold' : ''} />
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>

      {/* Bio */}
      {bio && (
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{bio}</p>
      )}

      {/* Subjects */}
      {subjects.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {subjects.slice(0, 4).map(s => (
            <span key={s} className="px-2 py-0.5 bg-hub-navy/60 text-hub-gold text-[10px] font-medium rounded-full border border-hub-gold/20">
              {s}
            </span>
          ))}
          {subjects.length > 4 && (
            <span className="px-2 py-0.5 bg-hub-dark-border text-gray-500 text-[10px] rounded-full">+{subjects.length - 4}</span>
          )}
        </div>
      )}

      {/* Universities */}
      {universities.length > 0 && (
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <MapPin size={11} className="text-hub-aqua flex-shrink-0" />
          <span className="truncate">{universities.slice(0, 2).join(', ')}</span>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 pt-1 border-t border-hub-dark-border">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Users size={13} className="text-hub-aqua" />
          <span>{students_count.toLocaleString()} students</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <BookOpen size={13} className="text-hub-gold" />
          <span>{activeGroups} groups</span>
        </div>
      </div>

      {/* CTA */}
      <Link
        to={`/hub/tutors/${id}`}
        className="w-full text-center py-2.5 rounded-xl bg-hub-gold/10 text-hub-gold text-sm font-semibold border border-hub-gold/20 hover:bg-hub-gold hover:text-hub-navy transition-all duration-200"
      >
        View Profile
      </Link>
    </motion.div>
  );
};
