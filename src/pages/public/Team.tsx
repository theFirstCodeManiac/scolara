import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
  github: string;
  linkedin: string;
  twitter: string;
}

const MEMBERS: TeamMember[] = [
  {
    name: "David O.",
    role: "Lead Engineer",
    image: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=400",
    bio: "Full stack wizard focused on building low-latency database schemas and highly interactive React interfaces.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com"
  },
  {
    name: "Sarah K.",
    role: "AI Researcher",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    bio: "Deep learning engineer trained in NLP, optimizing LLMs for localized academic context extraction and syllabus parsing.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com"
  },
  {
    name: "Emeka U.",
    role: "Product Designer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    bio: "UX strategist creating immersive digital experiences that keep university students motivated and focused.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com"
  }
];

export const Team: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-20 relative overflow-hidden font-sans">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#161b22_1px,transparent_1px),linear-gradient(to_bottom,#161b22_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-35 pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white mb-12 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/20 text-accent text-xs font-mono uppercase tracking-wider"
          >
            <Sparkles size={12} /> The Minds Behind Scolara
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl font-black tracking-tight"
          >
            Meet the{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Architects
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-gray-400 text-sm sm:text-base leading-relaxed"
          >
            We are a group of educators, researchers, and engineers passion-driven to fix academic struggles for college students.
          </motion.p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {MEMBERS.map((member, idx) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="group relative rounded-2xl bg-gray-900/60 border border-gray-800/80 overflow-hidden hover:border-primary/40 hover:-translate-y-2 transition-all duration-300 shadow-xl"
            >
              {/* Image Frame */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
                <span className="absolute bottom-4 left-4 text-xs font-bold font-mono px-2.5 py-1 rounded-md bg-primary/20 backdrop-blur-md text-primary border border-primary/20">
                  {member.role}
                </span>
              </div>

              {/* Bio Details */}
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{member.name}</h3>
                <p className="text-xs text-gray-400 leading-relaxed min-h-[64px]">{member.bio}</p>
                
                {/* Social links */}
                <div className="flex gap-3 pt-3 border-t border-gray-800/40">
                  <a href={member.github} target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-xs font-bold text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                    GH
                  </a>
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-xs font-bold text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                    IN
                  </a>
                  <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-xs font-bold text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                    X
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center py-10 border-t border-gray-850/60 flex flex-col items-center gap-2"
        >
          <p className="text-gray-500 text-sm flex items-center gap-1.5 justify-center">
            Built with <Heart className="text-red-500 animate-pulse fill-red-500" size={14} /> for academic excellence.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
