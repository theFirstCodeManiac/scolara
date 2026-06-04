import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Zap, Lock, Mail } from 'lucide-react';

/* ─── Typewriter phrases ──────────────────────────────────────── */
const PHRASES = [
  'Predict Your Exams.',
  'Ace Every Semester.',
  'Study Smarter, Not Harder.',
  'Unlock Academic Potential.',
];

/* ─── GitHub-style contribution dot grid ─────────────────────── */
const COLS = 26;
const ROWS = 7;
const TOTAL = COLS * ROWS;

function ContribGrid() {
  const [cells, setCells] = useState<number[]>(() =>
    Array.from({ length: TOTAL }, () => Math.random())
  );

  useEffect(() => {
    const id = setInterval(() => {
      setCells((prev) => {
        const next = [...prev];
        const idx = Math.floor(Math.random() * TOTAL);
        next[idx] = Math.random();
        return next;
      });
    }, 80);
    return () => clearInterval(id);
  }, []);

  const color = (v: number) => {
    if (v < 0.3) return 'bg-gray-800';
    if (v < 0.5) return 'bg-primary/20';
    if (v < 0.7) return 'bg-primary/50';
    if (v < 0.9) return 'bg-primary/80';
    return 'bg-primary';
  };

  return (
    <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
      {cells.map((v, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-sm transition-all duration-700 ${color(v)}`}
        />
      ))}
    </div>
  );
}

/* ─── Floating particle field ─────────────────────────────────── */
function Particles() {
  const count = 18;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${4 + Math.random() * 6}s ${Math.random() * 4}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── 3-D tilt card ──────────────────────────────────────────── */
function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = ((e.clientX - left) / width - 0.5) * 14;
    const y = ((e.clientY - top) / height - 0.5) * -14;
    el.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) scale3d(1.02,1.02,1.02)`;
  };

  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale3d(1,1,1)';
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="transition-transform duration-200 will-change-transform"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}

/* ─── Main Login Component ───────────────────────────────────── */
export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  // Typewriter
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const phrase = PHRASES[phraseIdx];
    let t: ReturnType<typeof setTimeout>;
    if (!deleting && displayed.length < phrase.length) {
      t = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length + 1)), 60);
    } else if (!deleting && displayed.length === phrase.length) {
      t = setTimeout(() => setDeleting(true), 2400);
    } else if (deleting && displayed.length > 0) {
      t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 28);
    } else {
      setDeleting(false);
      setPhraseIdx((p) => (p + 1) % PHRASES.length);
    }
    return () => clearTimeout(t);
  }, [displayed, deleting, phraseIdx]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        navigate('/dashboard');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Particle float keyframes */}
      <style>{`
        @keyframes float {
          0%   { transform: translateY(0) scale(1); opacity: 0.3; }
          100% { transform: translateY(-40px) scale(1.5); opacity: 0.8; }
        }
        @keyframes scanline {
          0%   { top: -10%; }
          100% { top: 110%; }
        }
      `}</style>

      <div className="min-h-screen flex bg-gray-950 font-sans relative overflow-hidden">
        {/* Base grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#161b22_1px,transparent_1px),linear-gradient(to_bottom,#161b22_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(79,70,229,0.12),transparent)] pointer-events-none" />

        <Particles />

        {/* Scan line effect */}
        <div
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none"
          style={{ animation: 'scanline 8s linear infinite' }}
        />

        {/* Back */}
        <Link to="/" className="absolute top-6 left-6 z-20 inline-flex items-center text-sm font-medium text-gray-600 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back
        </Link>

        {/* ── LEFT PANEL ── */}
        <div className="hidden lg:flex lg:flex-1 flex-col justify-center px-16 relative">
          <div className="relative z-10 max-w-xl space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-black text-white text-2xl shadow-xl shadow-primary/30">S</div>
              <div>
                <span className="text-2xl font-extrabold text-white tracking-tight">Scolara</span>
                <span className="ml-2 text-[10px] bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-mono">OS v1.0</span>
              </div>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
                Your Academic<br />
                <span className="bg-gradient-to-r from-primary via-violet-400 to-accent bg-clip-text text-transparent">
                  Operating System.
                </span>
              </h1>
              <div className="h-8 flex items-center mt-4">
                <p className="text-lg text-gray-400">
                  {displayed}
                  <span className="inline-block w-0.5 h-5 bg-primary ml-0.5 animate-pulse align-middle" />
                </p>
              </div>
            </div>

            {/* GitHub-style contribution heatmap */}
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Academic Activity</p>
              <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800/60 backdrop-blur">
                <ContribGrid />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px] text-gray-600 font-mono">Less</span>
                  <div className="flex items-center gap-1">
                    {['bg-gray-800','bg-primary/20','bg-primary/50','bg-primary/80','bg-primary'].map((c,i) => (
                      <div key={i} className={`w-2.5 h-2.5 rounded-sm ${c}`} />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-600 font-mono">More</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: '10K+', label: 'Students' },
                { value: '95%', label: 'Prediction Accuracy' },
                { value: '50+', label: 'Universities' },
              ].map((s) => (
                <div key={s.label} className="p-4 rounded-xl bg-gray-900/50 border border-gray-800/50 text-center">
                  <p className="text-2xl font-extrabold text-white">{s.value}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Glow orbs */}
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full filter blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-0 w-56 h-56 bg-accent/10 rounded-full filter blur-3xl pointer-events-none" />
        </div>

        {/* ── RIGHT PANEL — 3D Form ── */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 z-10">
          <div className="w-full max-w-md">
            <TiltCard>
              <div className="rounded-3xl bg-gray-900/70 backdrop-blur-2xl border border-gray-800/80 shadow-2xl shadow-black/60 p-8 relative overflow-hidden">
                {/* Inner glow top */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                {/* Inner corner accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none" />

                {/* Mobile logo */}
                <div className="flex items-center gap-2 mb-8 lg:hidden">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white text-lg">S</div>
                  <span className="text-xl font-bold text-white">Scolara</span>
                </div>

                <div className="mb-7">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-mono mb-4">
                    <Zap size={11} className="animate-pulse" /> Secure Session
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tight">Sign In</h2>
                  <p className="text-gray-500 text-sm mt-1">Enter your credentials to launch the OS.</p>
                </div>

                {error && (
                  <div className="p-3.5 mb-5 bg-red-950/50 text-red-400 rounded-xl text-sm border border-red-500/20 flex items-center gap-2">
                    <Lock size={13} className="flex-shrink-0" />
                    {error}
                  </div>
                )}

                <form className="space-y-4" onSubmit={handleLogin}>
                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={16} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@university.edu.ng"
                        className="w-full pl-10 pr-4 py-3 bg-gray-950/80 text-white text-sm placeholder-gray-700 border border-gray-800 rounded-xl focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/25 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={16} />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 bg-gray-950/80 text-white text-sm placeholder-gray-700 border border-gray-800 rounded-xl focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/25 transition-all"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="relative w-full h-12 mt-2 rounded-xl font-bold text-white text-sm tracking-wide overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-primary via-violet-500 to-accent hover:opacity-90 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {/* Shimmer sweep */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
                    {isLoading ? (
                      <span className="relative flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Authenticating...
                      </span>
                    ) : (
                      <span className="relative flex items-center justify-center gap-2">
                        <Zap size={15} /> Launch Dashboard
                      </span>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-gray-800" />
                  <span className="text-xs text-gray-700 font-mono">OR</span>
                  <div className="flex-1 h-px bg-gray-800" />
                </div>

                {/* Social hint buttons (visual only for now) */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700/60 text-gray-400 text-xs font-medium hover:border-gray-600 hover:text-white transition-all">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                    GitHub
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700/60 text-gray-400 text-xs font-medium hover:border-gray-600 hover:text-white transition-all">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    Twitter / X
                  </button>
                </div>

                <p className="text-center text-sm text-gray-600 mt-6">
                  No account?{' '}
                  <Link to="/auth/signup" className="font-semibold text-primary hover:text-accent transition-colors">
                    Create one free →
                  </Link>
                </p>

                {/* Bottom inner glow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
              </div>
            </TiltCard>
          </div>
        </div>
      </div>
    </>
  );
};
