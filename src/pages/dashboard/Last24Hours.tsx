import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Clock, Zap, BookOpen, Brain, Sparkles, CheckCircle2, Play, Square, RefreshCw, Send, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface CramTopic {
  name: string;
  importance: number; // 0-100
  summary: string;
  formula?: string;
}

const DEFAULT_COURSES = [
  { code: 'MTH101', name: 'Elementary Mathematics I' },
  { code: 'PHY101', name: 'General Physics I' },
  { code: 'CHM101', name: 'General Chemistry I' },
  { code: 'GST101', name: 'Communication in English' },
];

const CRAM_MATERIALS: Record<string, CramTopic[]> = {
  MTH101: [
    {
      name: 'Limits and Continuity',
      importance: 95,
      summary: 'Limits evaluate the value a function approaches as the input approaches some value. L\'Hopital\'s rule: if limit is 0/0 or inf/inf, differentiate numerator and denominator.',
      formula: 'lim(x->c) [f(x)/g(x)] = lim(x->c) [f\'(x)/g\'(x)]'
    },
    {
      name: 'Differentiation Rules',
      importance: 90,
      summary: 'Product Rule: d/dx[uv] = u\'v + uv\'. Quotient Rule: d/dx[u/v] = (u\'v - uv\')/v^2. Chain Rule for composite functions.',
      formula: 'd/dx [f(g(x))] = f\'(g(x)) * g\'(x)'
    },
    {
      name: 'Integration by Parts',
      importance: 85,
      summary: 'Derived from the product rule of differentiation. Choose u following LIATE rule (Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential).',
      formula: '∫ u dv = uv - ∫ v du'
    }
  ],
  PHY101: [
    {
      name: 'Newton\'s Laws of Motion',
      importance: 98,
      summary: '1st: Inertia. 2nd: F=ma. 3rd: Action and reaction are equal and opposite. Static vs kinetic friction: f_s <= mu_s * N, f_k = mu_k * N.',
      formula: 'F_net = m * a'
    },
    {
      name: 'Work, Energy, and Power',
      importance: 90,
      summary: 'Work is force times displacement. Kinetic Energy: 1/2 mv^2. Potential Energy: mgh. Power is rate of doing work (W/t or F*v).',
      formula: 'W = F * d * cos(theta)'
    },
    {
      name: 'Rotational Dynamics',
      importance: 80,
      summary: 'Angular displacement, velocity (omega), and acceleration (alpha). Torque is rotational force. Moment of Inertia (I) is resistance to rotation.',
      formula: 'Torque = I * alpha = r * F * sin(theta)'
    }
  ],
  CHM101: [
    {
      name: 'Stoichiometry & Mole Concept',
      importance: 95,
      summary: 'The mole relates the number of particles to mass. Moles = Mass / Molar Mass. Concentration = Moles / Volume. Avogadro\'s number = 6.022 x 10^23.',
      formula: 'n = m / M'
    },
    {
      name: 'Chemical Bonding & Hybridization',
      importance: 88,
      summary: 'Ionic (electron transfer), covalent (electron sharing), metallic bonding. VSEPR theory predicts shape. sp, sp^2, sp^3 hybridization dictates geometry.',
      formula: 'sp3 = tetrahedral (109.5°)'
    },
    {
      name: 'Gas Laws',
      importance: 80,
      summary: 'Boyle\'s Law (P1V1=P2V2), Charles\'s Law (V1/T1=V2/T2), Avogadro\'s Law. Ideal Gas Equation where R = 0.0821 L*atm/(mol*K).',
      formula: 'P * V = n * R * T'
    }
  ],
  GST101: [
    {
      name: 'Effective Listening Techniques',
      importance: 90,
      summary: 'Active vs passive listening. Barriers to listening: physical, psychological, semantic. Note-taking methods: Cornell system, mapping, outlining.',
      formula: 'L-I-S-T-E-N: Locate main ideas, Identify structure, Summarize'
    },
    {
      name: 'Reading and Comprehension Strategies',
      importance: 85,
      summary: 'SQ3R method: Survey, Question, Read, Recite, Review. Skimming (quick overview) vs Scanning (looking for specific facts).',
      formula: 'S-Q-3-R Method'
    }
  ]
};

export const Last24Hours: React.FC = () => {
  const { user: _user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState('MTH101');
  const [timeLeft, setTimeLeft] = useState(86400); // 24 hours in seconds
  const [examName, setExamName] = useState('MTH101 Exam');
  
  // Pomodoro sprint states (15 mins cram sprints)
  const [sprintTime, setSprintTime] = useState(900); // 15 mins in seconds
  const [isSprintActive, setIsSprintActive] = useState(false);

  // Quick Q&A AI Tutor state
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Checklist state
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Confirm exam hall venue and seat number', checked: false },
    { id: 2, text: 'Prepare calculator, pen, ID card, and face mask/slip', checked: false },
    { id: 3, text: 'Review the high-importance formula cheatsheet', checked: false },
    { id: 4, text: 'Complete at least 3 active recall summaries', checked: false },
    { id: 5, text: 'Set an alarm for 6.5 hours of solid sleep', checked: false },
  ]);

  // Main countdown timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Pomodoro countdown logic
  useEffect(() => {
    let interval: any = null;
    if (isSprintActive && sprintTime > 0) {
      interval = setInterval(() => {
        setSprintTime((prev) => prev - 1);
      }, 1000);
    } else if (sprintTime === 0) {
      setIsSprintActive(false);
      alert('Cram sprint finished! Take a 3-minute breather, then start the next topic.');
      setSprintTime(900);
    }
    return () => clearInterval(interval);
  }, [isSprintActive, sprintTime]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleChecklist = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setIsAiLoading(true);
    setAiResponse('');

    // Simulate direct exam tutor focus response
    setTimeout(() => {
      // _course removed - unused
      const answer = `[CRITICAL REVIEW FOR ${selectedCourse}] here is the exact concept breakdown:
1. Focus on the core formula: it will likely carry 3-5 marks.
2. In typical past exams, this question tests definition first, followed by application of boundary values.
3. Keep it simple: write down all variables given first to ensure partial credit.`;
      setAiResponse(answer);
      setIsAiLoading(false);
    }, 1500);
  };

  const activeCramTopics = CRAM_MATERIALS[selectedCourse] || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-red-500 dark:text-red-400 flex items-center gap-2">
            <ShieldAlert className="animate-pulse" size={26} /> Last 24 Hours: Cram Mode
          </h1>
          <p className="text-sm text-gray-500">
            High-yield revision, countdown timers, and focus sprint tools optimized for immediate exam prep.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-gray-400">Target Course:</span>
          <select
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setExamName(`${e.target.value} Exam`);
            }}
            className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary"
          >
            {DEFAULT_COURSES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Countdown & Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Giant Timer */}
        <Card className="p-6 bg-gradient-to-br from-red-950/40 via-gray-950 to-gray-950 border-red-500/20 text-center relative overflow-hidden flex flex-col justify-center min-h-[160px]">
          <div className="absolute top-0 right-0 p-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </div>
          <p className="text-xs font-mono text-red-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
            <Clock size={12} /> Time left until exam
          </p>
          <h2 className="text-5xl font-black text-white font-mono tracking-wider">{formatTime(timeLeft)}</h2>
          <p className="text-sm text-gray-400 mt-2 font-medium">{examName}</p>
        </Card>

        {/* Cram Sprint Pomodoro */}
        <Card className="p-6 bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800/80 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Zap className="text-amber-500" size={18} /> Cram Sprint (15 mins)
            </h3>
            <p className="text-xs text-gray-500 mt-1">Short, hyper-focused intervals designed for active recall.</p>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-2xl font-black text-gray-900 dark:text-white font-mono">
              {Math.floor(sprintTime / 60).toString().padStart(2, '0')}:
              {(sprintTime % 60).toString().padStart(2, '0')}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setIsSprintActive(!isSprintActive)}
                className={`p-2.5 rounded-xl text-white font-semibold transition-all ${
                  isSprintActive ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                {isSprintActive ? <Square size={16} /> : <Play size={16} />}
              </button>
              <button
                onClick={() => {
                  setIsSprintActive(false);
                  setSprintTime(900);
                }}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-all"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </Card>

        {/* Quick Review Stats */}
        <Card className="p-6 bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800/80 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="text-primary" size={18} /> Focus Metrics
            </h3>
            <p className="text-xs text-gray-500 mt-1">Required prep actions checked off.</p>
          </div>
          <div className="space-y-2 mt-3">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Revision Checklist</span>
              <span>{checklist.filter((c) => c.checked).length} of {checklist.length}</span>
            </div>
            <ProgressBar
              value={(checklist.filter((c) => c.checked).length / checklist.length) * 100}
              color="primary"
            />
          </div>
        </Card>
      </div>

      {/* Main Study Hub Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cheat Sheets / Topic breakdowns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="text-primary" size={20} /> High-Yield Concepts
            </h2>
            <span className="text-xs bg-red-100 dark:bg-red-950/40 text-red-500 border border-red-200 dark:border-red-500/20 px-2 py-0.5 rounded-full font-semibold">
              Must-Know Topics
            </span>
          </div>

          <div className="space-y-4">
            {activeCramTopics.map((topic, i) => (
              <Card key={i} className="p-5 bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800/80 space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-gray-900 dark:text-white text-base">{topic.name}</h4>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-red-50 dark:bg-red-900/10 text-red-500 font-bold border border-red-100 dark:border-red-500/20">
                    Weight: {topic.importance}%
                  </span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{topic.summary}</p>
                {topic.formula && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800/80 font-mono text-xs text-primary dark:text-accent-light overflow-x-auto">
                    {topic.formula}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Checklist + Quick Q&A sidebar */}
        <div className="space-y-6">
          {/* Prep checklist */}
          <Card className="p-6 bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800/80">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" size={18} /> Prep checklist
            </h3>
            <div className="space-y-3">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                    item.checked
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-gray-300 dark:border-gray-700 group-hover:border-primary'
                  }`}>
                    {item.checked && <CheckCircle2 size={14} />}
                  </div>
                  <span className={`text-xs leading-tight transition-all ${
                    item.checked ? 'line-through text-gray-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Exam Tutor Chatbot */}
          <Card className="p-6 bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800/80 space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Brain className="text-violet-500" size={18} /> Instant Recall Tutor
            </h3>
            <p className="text-xs text-gray-500">Ask a quick query, receive a short, sharp recall guide.</p>
            <form onSubmit={handleAskAi} className="space-y-3">
              <div className="relative">
                <input
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. Explain L'Hopital rule simply"
                  className="w-full pl-3 pr-9 py-2.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-all">
                  <Send size={13} />
                </button>
              </div>
            </form>

            {isAiLoading ? (
              <div className="py-4 text-center">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
              </div>
            ) : aiResponse ? (
              <div className="p-3.5 bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-500/10 rounded-xl text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-mono">
                {aiResponse}
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
};
