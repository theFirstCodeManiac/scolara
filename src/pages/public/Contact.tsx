import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Sparkles, Send, CheckCircle2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 4000);
  };

  const FAQS = [
    { q: "Is Scolara free to use?", a: "Yes, you can register and access all basic AI tools and study tools for free. Premium mock test predictions and specific advanced features can be unlocked on-demand." },
    { q: "Which universities are supported?", a: "We support major Nigerian universities (UNILAG, UI, OAU, ABU, UNN, etc.) with custom faculty lists, dynamic exam predictors, and class intelligence sharing." },
    { q: "Can I sell my study notes?", a: "Yes! Our Marketplace allows students to upload high-quality revision resources and set their preferred price. Earnings can be cashed out securely." }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-20 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#161b22_1px,transparent_1px),linear-gradient(to_bottom,#161b22_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white mb-12 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        {/* Top Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono uppercase tracking-wider">
            <Sparkles size={12} /> Support Center
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Let's Connect</h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Have questions about Scolara? Want to partner with us or bring the OS to your department? Fill out the form or drop us a line.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-20">
          {/* Info Panel + FAQ */}
          <div className="space-y-8">
            <div className="space-y-6">
              {[
                { title: "Direct Contact", val: "officialscolara@gmail.com", icon: Mail, subtitle: "Expect response within 24h" },
                { title: "Call Hotline", val: "+234 (0) 800 SCOLARA", icon: Phone, subtitle: "Mon - Fri, 9am - 5pm WAT" },
                { title: "HQ Office", val: "Lagos, Nigeria", icon: MapPin, subtitle: "Virtual & In-person hubs" }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl bg-gray-900/50 border border-gray-800/80 hover:border-gray-700/60 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-primary">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">{item.title}</h4>
                    <p className="text-sm font-semibold text-gray-300 mt-0.5">{item.val}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Accordion FAQ */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white mb-2">Frequently Asked Questions</h3>
              {FAQS.map((faq, i) => (
                <div key={i} className="rounded-xl border border-gray-800/80 bg-gray-900/30 overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm hover:text-white transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={16} className={`text-gray-500 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {activeFaq === i && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-4 text-xs text-gray-400 leading-relaxed border-t border-gray-850/60 pt-3">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Form Panel */}
          <div className="p-8 bg-gray-900/60 border border-gray-800/80 rounded-3xl relative overflow-hidden shadow-2xl">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-16 text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-emerald-950/60 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] mx-auto animate-pulse">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Transmission Received</h3>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                    Thank you, {formData.name}. Your inquiry has been forwarded to the support desk. We will reach back shortly.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Full Name</label>
                    <input
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-3 text-sm bg-gray-950/60 border border-gray-800 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. john@example.com"
                      className="w-full px-4 py-3 text-sm bg-gray-950/60 border border-gray-800 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How can we support you today?"
                      className="w-full px-4 py-3 text-sm bg-gray-950/60 border border-gray-800 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                    <Send size={15} /> Send Transmission
                  </button>
                </form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
