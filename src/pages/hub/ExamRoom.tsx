import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertCircle, ChevronRight, ChevronLeft, CheckCircle, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useHub } from '../../context/HubContext';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  image_url?: string;
  options: { id: string; text: string; is_correct: boolean }[];
  points: number;
  order_index: number;
}

interface Exam {
  id: string;
  title: string;
  instructions?: string;
  duration_minutes: number;
  pass_mark: number;
  total_marks: number;
}

export const ExamRoom: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const { hubUser } = useHub();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [session, setSession] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const timerRef = useRef<NodeJS.Timeout>();
  const autoSaveRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchExamData();
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(autoSaveRef.current);
    };
  }, [examId]);

  const fetchExamData = async () => {
    if (!examId || !hubUser) return;
    setLoading(true);

    const { data: examData } = await supabase.from('hub_exams').select('*').eq('id', examId).single();
    if (!examData) { navigate('/hub/groups'); return; }
    setExam(examData);

    const { data: qData } = await supabase.from('hub_questions').select('*').eq('exam_id', examId).order('order_index');
    setQuestions(qData || []);

    const { data: sessData } = await supabase
      .from('hub_exam_sessions')
      .select('*')
      .eq('exam_id', examId)
      .eq('student_id', hubUser.id)
      .single();

    if (sessData?.status === 'submitted') {
      navigate(`/hub/exam/${examId}/results`);
      return;
    }

    setSession(sessData);
    const savedAnswers = sessData?.answers || {};
    setAnswers(savedAnswers);

    // Calculate time left
    if (sessData?.started_at) {
      const elapsed = Math.floor((Date.now() - new Date(sessData.started_at).getTime()) / 1000);
      const totalSeconds = examData.duration_minutes * 60;
      const remaining = Math.max(0, totalSeconds - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        await handleAutoSubmit(sessData.id, savedAnswers, examData, qData || []);
        return;
      }
    }

    setLoading(false);
    setShowInstructions(Object.keys(savedAnswers).length === 0);
  };

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit(session?.id, answers, exam!, questions);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [session, answers, exam, questions]);

  useEffect(() => {
    if (!loading && !showInstructions && timeLeft > 0) {
      startTimer();
    }
    return () => clearInterval(timerRef.current);
  }, [loading, showInstructions, startTimer]);

  const handleAnswer = (questionId: string, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    scheduleAutoSave(newAnswers);
  };

  const scheduleAutoSave = (newAnswers: Record<string, string>) => {
    clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => autoSave(newAnswers), 3000);
  };

  const autoSave = async (currentAnswers: Record<string, string>) => {
    if (!session?.id) return;
    setAutoSaving(true);
    await supabase.from('hub_exam_sessions').update({ answers: currentAnswers }).eq('id', session.id);
    setAutoSaving(false);
  };

  const handleAutoSubmit = async (sessionId: string, currentAnswers: Record<string, string>, examData: Exam, qs: Question[]) => {
    await submitExam(sessionId, currentAnswers, examData, qs);
  };

  const submitExam = async (
    sessionId: string,
    currentAnswers: Record<string, string>,
    examData: Exam,
    qs: Question[]
  ) => {
    setSubmitting(true);

    // Calculate score
    let score = 0;
    let totalPoints = 0;
    qs.forEach(q => {
      totalPoints += q.points;
      const userAnswer = currentAnswers[q.id];
      if (q.question_type === 'mcq' || q.question_type === 'true_false') {
        const correct = q.options.find(o => o.is_correct);
        if (correct && userAnswer === correct.id) score += q.points;
      }
    });

    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const passed = percentage >= examData.pass_mark;

    await supabase.from('hub_exam_sessions').update({
      answers: currentAnswers,
      score,
      percentage,
      passed,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    }).eq('id', sessionId);

    navigate(`/hub/exam/${examData.id}/results`);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isUrgent = timeLeft < 300; // Last 5 minutes

  if (loading) {
    return (
      <div className="bg-hub-dark-bg min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-hub-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (showInstructions && exam) {
    return (
      <div className="bg-hub-dark-bg min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg w-full bg-hub-dark-surface border border-hub-dark-border rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-hub-gold/10 flex items-center justify-center mx-auto mb-4 border border-hub-gold/20">
              <AlertCircle size={28} className="text-hub-gold" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">{exam.title}</h2>
          </div>
          <div className="space-y-3 mb-6">
            {[
              { label: 'Duration', value: `${exam.duration_minutes} minutes` },
              { label: 'Questions', value: questions.length },
              { label: 'Pass Mark', value: `${exam.pass_mark}%` },
              { label: 'Total Marks', value: exam.total_marks },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-hub-dark-border">
                <span className="text-sm text-gray-400">{item.label}</span>
                <span className="text-sm font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
          {exam.instructions && (
            <div className="mb-6 p-4 bg-hub-dark-bg rounded-xl border border-hub-dark-border">
              <p className="text-sm text-gray-400 leading-relaxed">{exam.instructions}</p>
            </div>
          )}
          <div className="space-y-2 mb-6 text-sm text-gray-500">
            <p>✅ Your answers are auto-saved every 3 seconds</p>
            <p>✅ Timer starts when you click "Begin Exam"</p>
            <p>⚠️ Exam auto-submits when time runs out</p>
          </div>
          <button
            onClick={() => { setShowInstructions(false); if (timeLeft > 0) startTimer(); }}
            className="w-full py-3.5 bg-hub-gold text-hub-navy font-extrabold text-base rounded-xl hover:bg-hub-gold-dark transition-all shadow-lg shadow-hub-gold/20"
          >
            Begin Exam →
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-hub-dark-bg min-h-screen flex flex-col">
      {/* Header bar */}
      <div className={`sticky top-0 z-20 border-b border-hub-dark-border px-4 py-3 flex items-center justify-between ${isUrgent ? 'bg-red-950/60' : 'bg-hub-dark-bg/90 backdrop-blur-sm'}`}>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-white truncate max-w-[150px]">{exam?.title}</span>
          <span className="text-xs text-gray-500">{answeredCount}/{questions.length} answered</span>
          {autoSaving && <span className="text-[11px] text-hub-aqua flex items-center gap-1"><Save size={10} className="animate-spin" /> Saving...</span>}
        </div>
        <div className={`flex items-center gap-2 font-mono font-bold text-lg ${isUrgent ? 'text-red-400 animate-pulse' : 'text-hub-gold'}`}>
          <Clock size={16} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-hub-dark-border">
        <motion.div className="h-full bg-hub-gold transition-all" animate={{ width: `${progress}%` }} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Question navigator (desktop) */}
        <div className="hidden lg:block w-56 border-r border-hub-dark-border p-4 overflow-y-auto">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Questions</p>
          <div className="grid grid-cols-5 gap-1.5">
            {questions.map((q, i) => {
              const answered = !!answers[q.id];
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    i === currentIndex ? 'bg-hub-gold text-hub-navy' :
                    answered ? 'bg-hub-aqua/20 text-hub-aqua border border-hub-aqua/30' :
                    'bg-hub-dark-surface border border-hub-dark-border text-gray-500 hover:border-hub-gold/30'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-1.5 text-[11px] text-gray-600">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-hub-aqua/20 border border-hub-aqua/30" /> Answered</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-hub-gold" /> Current</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-hub-dark-surface border border-hub-dark-border" /> Unanswered</div>
          </div>
        </div>

        {/* Question area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-3xl mx-auto w-full">
          {currentQuestion && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-hub-gold uppercase tracking-widest">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-xs text-gray-500">{currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}</span>
                </div>

                <div className="p-6 bg-hub-dark-surface border border-hub-dark-border rounded-2xl mb-6">
                  <p className="text-base font-semibold text-white leading-relaxed">{currentQuestion.question_text}</p>
                  {currentQuestion.image_url && (
                    <img src={currentQuestion.image_url} alt="question" className="mt-4 rounded-xl max-h-48 object-contain border border-hub-dark-border" />
                  )}
                </div>

                {/* MCQ Options */}
                {currentQuestion.question_type === 'mcq' && (
                  <div className="space-y-3">
                    {currentQuestion.options.map(opt => {
                      const selected = answers[currentQuestion.id] === opt.id;
                      return (
                        <motion.button
                          key={opt.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleAnswer(currentQuestion.id, opt.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                            selected
                              ? 'bg-hub-gold/10 border-hub-gold text-white shadow-lg shadow-hub-gold/10'
                              : 'bg-hub-dark-surface border-hub-dark-border text-gray-300 hover:border-hub-gold/30'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border-2 transition-all ${selected ? 'border-hub-gold bg-hub-gold text-hub-navy' : 'border-gray-600 text-gray-500'}`}>
                            {opt.id.toUpperCase()}
                          </div>
                          <span className="text-sm">{opt.text}</span>
                          {selected && <CheckCircle size={16} className="ml-auto text-hub-gold flex-shrink-0" />}
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* True/False */}
                {currentQuestion.question_type === 'true_false' && (
                  <div className="flex gap-4">
                    {['true', 'false'].map(v => {
                      const selected = answers[currentQuestion.id] === v;
                      return (
                        <motion.button
                          key={v}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleAnswer(currentQuestion.id, v)}
                          className={`flex-1 py-4 rounded-xl border font-bold text-base capitalize transition-all ${
                            selected ? 'bg-hub-gold text-hub-navy border-hub-gold' : 'bg-hub-dark-surface border-hub-dark-border text-gray-400 hover:border-hub-gold/30'
                          }`}
                        >
                          {v === 'true' ? '✓ True' : '✗ False'}
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Short Answer / Essay */}
                {(currentQuestion.question_type === 'short_answer' || currentQuestion.question_type === 'essay') && (
                  <textarea
                    value={answers[currentQuestion.id] || ''}
                    onChange={e => handleAnswer(currentQuestion.id, e.target.value)}
                    placeholder={currentQuestion.question_type === 'short_answer' ? 'Type your answer...' : 'Write your essay response...'}
                    rows={currentQuestion.question_type === 'essay' ? 8 : 3}
                    className="w-full bg-hub-dark-surface border border-hub-dark-border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-hub-gold/40"
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-5 py-2.5 border border-hub-dark-border text-gray-400 rounded-xl hover:text-white hover:border-hub-dark-border/60 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 hidden sm:block">{answeredCount}/{questions.length} answered</span>
              {isLastQuestion ? (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-hub-gold text-hub-navy font-bold rounded-xl hover:bg-hub-gold-dark transition-all shadow-lg shadow-hub-gold/20"
                >
                  Submit Exam <CheckCircle size={16} />
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                  className="flex items-center gap-2 px-5 py-2.5 bg-hub-gold text-hub-navy font-bold rounded-xl hover:bg-hub-gold-dark transition-all"
                >
                  Next <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit confirm modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-hub-dark-surface border border-hub-dark-border rounded-2xl p-6 max-w-sm w-full text-center">
              <AlertCircle size={32} className="text-hub-gold mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Submit exam?</h3>
              <p className="text-sm text-gray-400 mb-2">
                You've answered <span className="text-hub-gold font-bold">{answeredCount}</span> out of <span className="text-white font-bold">{questions.length}</span> questions.
              </p>
              {answeredCount < questions.length && (
                <p className="text-xs text-yellow-400 mb-4">⚠️ {questions.length - answeredCount} question{questions.length - answeredCount > 1 ? 's' : ''} left unanswered.</p>
              )}
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 border border-hub-dark-border text-gray-400 rounded-xl hover:text-white text-sm transition-all">
                  Continue
                </button>
                <button
                  onClick={() => { setShowConfirm(false); submitExam(session?.id, answers, exam!, questions); }}
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-hub-gold text-hub-navy font-bold rounded-xl hover:bg-hub-gold-dark text-sm disabled:opacity-60 transition-all"
                >
                  {submitting ? 'Submitting...' : 'Submit Now'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
