import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UserCheck, ShieldAlert, BadgeDollarSign, FileWarning, CheckCircle } from 'lucide-react';
// motion removed - unused

export const TermsOfService: React.FC = () => {
  const [activeSection, setActiveSection] = useState('accounts');

  const SECTIONS = [
    { id: 'accounts', title: '1. User Accounts', icon: UserCheck },
    { id: 'use', title: '2. Acceptable Use', icon: ShieldAlert },
    { id: 'payments', title: '3. Payments & Fees', icon: BadgeDollarSign },
    { id: 'liability', title: '4. Limitation of Liability', icon: FileWarning },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-20 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#161b22_1px,transparent_1px),linear-gradient(to_bottom,#161b22_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-35 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-accent/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white mb-12 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        {/* Title */}
        <div className="space-y-3 mb-16">
          <span className="text-xs font-mono text-primary uppercase tracking-widest">Legal Document</span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">Terms of Service</h1>
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
            <div id="accounts" className="space-y-4 scroll-mt-28">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UserCheck className="text-primary" size={20} /> 1. User Accounts
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                By registering on Scolara, you agree to provide authentic, correct profile details, including your email,
                name, and university details. You are responsible for preserving credentials confidentiality and ensuring all
                activities on your account comply with school honor codes.
              </p>
            </div>

            <div id="use" className="space-y-4 scroll-mt-28">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldAlert className="text-primary" size={20} /> 2. Acceptable Use
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Our platform and AI prediction models are created to boost study strategies and are not tools to facilitate
                exam malpractice. You may not upload copyright-infringing materials, distribute harmful scripts, or attempt
                unauthorized queries to backend systems.
              </p>
              <ul className="space-y-2 text-xs text-gray-500 font-mono">
                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-primary" /> No system spamming or hacking</li>
                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-primary" /> No selling plagiarized course documents</li>
                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-primary" /> Compliance with local academic standards</li>
              </ul>
            </div>

            <div id="payments" className="space-y-4 scroll-mt-28">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BadgeDollarSign className="text-primary" size={20} /> 3. Payments & Fees
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Buying resource files in the Marketplace involves processing transactions through secured channels (e.g. Stripe/Paystack).
                Refunds are evaluated individually based on resource quality metrics and seller compliance.
              </p>
            </div>

            <div id="liability" className="space-y-4 scroll-mt-28">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileWarning className="text-primary" size={20} /> 4. Limitation of Liability
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Scolara AI models provide exam forecasts based on historical outlines. These are guidelines, not guarantees.
                We are not held liable for final university grades, grade outcomes, or server dropouts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
