import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie, Sliders, Info, CheckCircle } from 'lucide-react';
// motion removed - unused

export const CookiePolicy: React.FC = () => {
  const [activeSection, setActiveSection] = useState('what');

  const SECTIONS = [
    { id: 'what', title: '1. What are Cookies', icon: Cookie },
    { id: 'how', title: '2. How We Use Cookies', icon: Info },
    { id: 'control', title: '3. Controlling Cookies', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-20 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#161b22_1px,transparent_1px),linear-gradient(to_bottom,#161b22_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-35 pointer-events-none" />
      <div className="absolute top-0 left-0 w-[450px] h-[450px] bg-accent/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white mb-12 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        {/* Title */}
        <div className="space-y-3 mb-16">
          <span className="text-xs font-mono text-primary uppercase tracking-widest">Legal Document</span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">Cookie Policy</h1>
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
            <div id="what" className="space-y-4 scroll-mt-28">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Cookie className="text-primary" size={20} /> 1. What are Cookies?
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Cookies are tiny text files placed on your browser or device when visiting digital services. They assist the app in
                remembering session attributes and caching preferences.
              </p>
            </div>

            <div id="how" className="space-y-4 scroll-mt-28">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Info className="text-primary" size={20} /> 2. How We Use Cookies?
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                We use cookies to maintain your authenticated login session on Supabase so that you don't have to re-enter
                credentials on every reload. Additionally, we remember your theme configuration (light vs dark mode).
              </p>
              <ul className="space-y-2 text-xs text-gray-500 font-mono">
                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-primary" /> Session Tokens & Keep-Alive cookies</li>
                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-primary" /> Theme Toggle preferences (Light/Dark)</li>
                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-primary" /> Local Storage keys for UI state caching</li>
              </ul>
            </div>

            <div id="control" className="space-y-4 scroll-mt-28">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sliders className="text-primary" size={20} /> 3. Controlling Cookies
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                You can block or purge cookies through your individual browser controls. However, disabling technical essential session
                cookies will restrict you from logging in or using the authenticated dashboard modules.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
