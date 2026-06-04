import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, FileText, CheckCircle } from 'lucide-react';
// motion removed - unused

export const PrivacyPolicy: React.FC = () => {
  const [activeSection, setActiveSection] = useState('collect');

  const SECTIONS = [
    { id: 'collect', title: '1. Information We Collect', icon: Eye },
    { id: 'use', title: '2. How We Use Information', icon: FileText },
    { id: 'protect', title: '3. Data Protection & Security', icon: Lock },
    { id: 'share', title: '4. Third-Party Sharing', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-20 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#161b22_1px,transparent_1px),linear-gradient(to_bottom,#161b22_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-35 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-primary/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white mb-12 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        {/* Title */}
        <div className="space-y-3 mb-16">
          <span className="text-xs font-mono text-primary uppercase tracking-widest">Legal Document</span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">Privacy Policy</h1>
          <p className="text-xs text-gray-500 font-mono">Last updated: June 1, 2026</p>
        </div>

        {/* Layout: Sidebar + Document Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
          {/* Sticky Quick-Nav */}
          <div className="lg:col-span-1 space-y-2 lg:sticky lg:top-24">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    setActiveSection(sec.id);
                    document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider text-left transition-all border ${
                    isActive
                      ? 'bg-primary/10 text-primary border-primary/20 shadow-md shadow-primary/5'
                      : 'bg-transparent text-gray-500 border-transparent hover:text-gray-300'
                  }`}
                >
                  <Icon size={14} />
                  <span>{sec.title}</span>
                </button>
              );
            })}
          </div>

          {/* Core Content */}
          <div className="lg:col-span-3 space-y-12 bg-gray-900/40 border border-gray-800/80 p-8 sm:p-10 rounded-3xl backdrop-blur-xl shadow-xl">
            <div id="collect" className="space-y-4 scroll-mt-28">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Eye className="text-primary" size={20} /> 1. Information We Collect
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                When you create an account on Scolara, we collect basic details such as your full name, email, matriculation
                number, and chosen university department. This data allows us to tailor predictive course ranking models and
                personalize study guide plans.
              </p>
              <ul className="space-y-2 text-xs text-gray-500 font-mono">
                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-primary" /> Username, phone number, and address</li>
                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-primary" /> Profile pictures & study resources uploaded</li>
                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-primary" /> Attached study PDFs analyzed by AI Tutor</li>
              </ul>
            </div>

            <div id="use" className="space-y-4 scroll-mt-28">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="text-primary" size={20} /> 2. How We Use Information
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                The collected information is used directly to deliver the Academic OS modules. AI OCR processors run
                topic-extraction heuristics to forecast syllabus percentages. Emails are utilized for critical security
                updates, and optional newsletters (authorized via the footer form).
              </p>
            </div>

            <div id="protect" className="space-y-4 scroll-mt-28">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Lock className="text-primary" size={20} /> 3. Data Protection & Security
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                We implement industrial-grade security systems. All authentication states are managed via secure Supabase token
                keys. RLS policies isolate database records so that users can only view their own topics, custom study plans,
                and private messages.
              </p>
            </div>

            <div id="share" className="space-y-4 scroll-mt-28">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="text-primary" size={20} /> 4. Third-Party Sharing
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                We do not sell, rent, or lease your personal information to third parties. We cooperate with service provider APIs
                (like Groq Llama models) only to evaluate AI tutoring queries and PDF files under strict data isolation settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
