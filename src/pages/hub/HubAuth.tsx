import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowLeft, Phone, BookOpen } from 'lucide-react';
import { useHub } from '../../context/HubContext';

const NIGERIAN_UNIVERSITIES = [
  'University of Lagos (UNILAG)',
  'University of Ibadan (UI)',
  'Ahmadu Bello University (ABU)',
  'Obafemi Awolowo University (OAU)',
  'University of Nigeria, Nsukka (UNN)',
  'University of Benin (UNIBEN)',
  'Federal University of Technology, Akure (FUTA)',
  'University of Ilorin (UNILORIN)',
  'Bayero University Kano (BUK)',
  'University of Port Harcourt (UNIPORT)',
  'Nnamdi Azikiwe University (UNIZIK)',
  'Covenant University',
  'Lagos State University (LASU)',
  'Rivers State University',
  'Other',
];

const SUBJECTS = [
  'Mathematics', 'English Language', 'Physics', 'Chemistry',
  'Biology', 'Economics', 'Government', 'Literature in English',
  'Agricultural Science', 'Geography', 'History', 'Commerce',
  'Accounting', 'Computer Science', 'Further Mathematics',
];

type AuthMode = 'login' | 'signup-aspirant' | 'signup-tutor';

export const HubAuth: React.FC = () => {
  const { hubSignIn, hubSignUp } = useHub();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/hub/groups';

  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [targetUniversity, setTargetUniversity] = useState('');
  // targetCourse state removed - unused
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject].slice(0, 4)
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await hubSignIn(email, password);
    if (error) {
      setError(error);
      setLoading(false);
      return;
    }
    navigate(redirectTo);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    setLoading(true);
    setError(null);

    const role = mode === 'signup-tutor' ? 'hub_tutor' : 'aspirant';
    const { error } = await hubSignUp({ email, password, full_name: fullName, role });

    if (error) {
      setError(error);
      setLoading(false);
      return;
    }
    navigate(mode === 'signup-tutor' ? '/hub/tutor-panel' : redirectTo);
  };

  const inputClass = "w-full bg-hub-dark-bg border border-hub-dark-border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-hub-gold/50 focus:ring-1 focus:ring-hub-gold/20 transition-all";

  return (
    <div className="min-h-screen bg-hub-dark-bg flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-hub-gold/4 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-hub-aqua/4 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Back to hub */}
        <Link to="/hub" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-hub-gold mb-6 transition-colors">
          <ArrowLeft size={15} /> Back to Hub
        </Link>

        <div className="bg-hub-dark-surface border border-hub-dark-border rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-hub-gold to-hub-aqua flex items-center justify-center mx-auto mb-3 shadow-lg shadow-hub-gold/20">
              <GraduationCap size={26} className="text-hub-navy" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">
              {mode === 'login' ? 'Welcome back' : 'Join the Hub'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {mode === 'login' ? 'Sign in to continue your preparation' : 'Create your free account'}
            </p>
          </div>

          {/* Mode tabs (only for signup) */}
          {mode !== 'login' && (
            <div className="flex gap-2 mb-6 p-1 bg-hub-dark-bg rounded-xl border border-hub-dark-border">
              <button
                onClick={() => setMode('signup-aspirant')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  mode === 'signup-aspirant' ? 'bg-hub-gold text-hub-navy' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                📚 Aspirant
              </button>
              <button
                onClick={() => setMode('signup-tutor')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  mode === 'signup-tutor' ? 'bg-hub-aqua text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                🎓 Tutor
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-700/40 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
            {mode !== 'login' && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Your full name"
                    required
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  className={`${inputClass} pl-10 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Aspirant-specific fields */}
            {mode === 'signup-aspirant' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Phone Number (optional)</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+234..."
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Target University (optional)</label>
                  <select
                    value={targetUniversity}
                    onChange={e => setTargetUniversity(e.target.value)}
                    className={`${inputClass} appearance-none`}
                  >
                    <option value="">Select university...</option>
                    {NIGERIAN_UNIVERSITIES.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    UTME Subjects <span className="text-gray-600">(pick up to 4)</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                    {SUBJECTS.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSubject(s)}
                        className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all ${
                          selectedSubjects.includes(s)
                            ? 'bg-hub-gold text-hub-navy border-hub-gold'
                            : 'bg-hub-dark-bg text-gray-500 border-hub-dark-border hover:border-hub-gold/30'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg mt-2"
              style={{ backgroundColor: mode === 'signup-tutor' ? '#457B9D' : '#F4D35E', color: mode === 'signup-tutor' ? 'white' : '#1D3557' }}
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Please wait...</>
              ) : mode === 'login' ? (
                'Sign In to Hub'
              ) : mode === 'signup-tutor' ? (
                'Create Tutor Account'
              ) : (
                'Create Aspirant Account'
              )}
            </button>
          </form>

          {/* Toggle links */}
          <div className="mt-5 text-center space-y-2">
            {mode === 'login' ? (
              <p className="text-sm text-gray-500">
                New to the hub?{' '}
                <button onClick={() => setMode('signup-aspirant')} className="text-hub-gold hover:underline font-semibold">
                  Create free account
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <button onClick={() => setMode('login')} className="text-hub-gold hover:underline font-semibold">
                  Sign in
                </button>
              </p>
            )}

            <div className="flex items-center gap-2 text-[11px] text-gray-600">
              <div className="flex-1 h-px bg-hub-dark-border" />
              <BookOpen size={11} />
              <div className="flex-1 h-px bg-hub-dark-border" />
            </div>
            <p className="text-[11px] text-gray-600">
              This hub is for Post-UTME aspirants, not university students.{' '}
              <Link to="/auth/login" className="text-hub-aqua hover:underline">Go to Scolara OS →</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
