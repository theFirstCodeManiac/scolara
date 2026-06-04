import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Zap, Sparkles, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-20 relative overflow-hidden font-sans">
      {/* Dynamic Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#161b22_1px,transparent_1px),linear-gradient(to_bottom,#161b22_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30 pointer-events-none" />
      
      {/* Gradient Glow Blobs */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[450px] h-[450px] bg-accent/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white mb-12 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>
        
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono uppercase tracking-wider"
          >
            <Sparkles size={12} /> The Future of Study
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight"
          >
            Eliminating Guesswork from{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Academic Excellence
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed"
          >
            Scolara is an intelligent, AI-powered academic operating system built specifically for Nigerian university students.
            We turn hours of confusing study into clear, data-driven exam preparation pathways.
          </motion.p>
        </div>

        {/* Pillars / Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {[
            {
              title: "Predictive Insights",
              desc: "By analyzing past exam papers, course outlines, and lecturer patterns, our AI scores and targets what will actually be examined.",
              icon: Target,
              color: "from-emerald-500 to-teal-500",
              bg: "bg-emerald-500/10"
            },
            {
              title: "Adaptive Tutoring",
              desc: "Personalized AI explanations break down complex topics into relatable Nigerian analogies and summarized flashcard formats.",
              icon: Zap,
              color: "from-primary to-accent",
              bg: "bg-primary/10"
            },
            {
              title: "Shared Intelligence",
              desc: "Collaborative marketplace and study hubs build collective academic momentum across departments and semesters.",
              icon: BookOpen,
              color: "from-violet-500 to-purple-500",
              bg: "bg-violet-500/10"
            }
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
              className="group relative overflow-hidden rounded-2xl bg-gray-900/60 border border-gray-800/80 p-6 hover:border-primary/30 transition-all duration-300"
            >
              <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <item.icon className="text-white" size={20} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </motion.div>
          ))}
        </div>

        {/* Vision & Mission Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 border border-gray-800/80 p-8 sm:p-12 mb-20 relative overflow-hidden shadow-xl"
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Our Vision</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                To become the primary digital infrastructure for higher education in Africa. We aim to ensure that no student
                fails due to lack of quality mentorship, poor access to materials, or directionless exam prep.
              </p>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Our Mission</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                By deploying modern artificial intelligence, we synthesize vast syllabi into actionable steps, democratizing
                access to personalized learning systems and boosting academic performance across Nigerian universities.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
