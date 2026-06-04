import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, CheckCircle2, XCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useHub } from '../../context/HubContext';
import { callGroqApi } from '../../lib/groq';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: { id: string; text: string; is_correct: boolean }[];
  correct_answer: string;
  explanation?: string;
  points: number;
}

export const ExamResults: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const { hubUser } = useHub();
  const navigate = useNavigate();

  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [generatingAi, setGeneratingAi] = useState(false);

  useEffect(() => {
    fetchResults();
  }, [examId, hubUser]);

  const fetchResults = async () => {
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

    if (!sessData || sessData.status !== 'submitted') {
      navigate(`/hub/exam/${examId}`);
      return;
    }
    setSession(sessData);
    setLoading(false);
  };

  const explainWithAI = async () => {
    if (generatingAi || !exam || questions.length === 0) return;
    setGeneratingAi(true);
    
    // Pick first wrong answer or any question if all are correct
    let targetQuestion = questions[0];
    const wrongQs = questions.filter(q => {
      const ans = session?.answers?.[q.id];
      if (q.question_type === 'mcq' || q.question_type === 'true_false') {
        const correct = q.options.find(o => o.is_correct);
        return correct && ans !== correct.id;
      }
      return ans !== q.correct_answer;
    });

    if (wrongQs.length > 0) {
      targetQuestion = wrongQs[0];
    }

    const messages = [
      {
        role: 'system' as const,
        content: 'You are Scolara AI, an expert tutor specialized in preparing Nigerian students for university entrance examinations (Post-UTME). Explain this question, the correct answer, and break it down step-by-step in a friendly, encouraging, and extremely educational manner.',
      },
      {
        role: 'user' as const,
        content: `Subject: ${exam.subject || 'General'}
Question: ${targetQuestion.question_text}
Options: ${JSON.stringify(targetQuestion.options)}
Correct Answer: ${targetQuestion.correct_answer}
Student Answer: ${session?.answers?.[targetQuestion.id] || 'None'}

Please provide a detailed, easy-to-understand explanation. Include any formulas if applicable.`,
      },
    ];

    try {
      const res = await callGroqApi(messages);
      setAiExplanation(res);
    } catch (e) {
      setAiExplanation('Unable to generate AI explanation at this time. Please try again.');
    } finally {
      setGeneratingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-hub-dark-bg min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-hub-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const passed = session.percentage >= exam.pass_mark;

  return (
    <div className="bg-hub-dark-bg min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Link to={`/hub/groups/${exam.group_id}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-white mb-6">
          <ArrowLeft size={15} /> Back to Group
        </Link>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-8 border rounded-3xl text-center mb-8 relative overflow-hidden ${
            passed ? 'bg-green-950/20 border-green-700/30' : 'bg-red-950/20 border-red-700/30'
          }`}
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${passed ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            <Award size={36} className={passed ? 'text-green-400' : 'text-red-400'} />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">{exam.title} Results</h1>
          <p className="text-sm text-gray-400 mb-6">Submitted on {new Date(session.submitted_at).toLocaleString()}</p>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6 bg-hub-dark-bg/60 p-4 rounded-2xl border border-hub-dark-border">
            <div>
              <span className="block text-[10px] text-gray-500 uppercase font-semibold">Score</span>
              <span className="text-lg font-extrabold text-white">{session.score} / {questions.length}</span>
            </div>
            <div>
              <span className="block text-[10px] text-gray-500 uppercase font-semibold">Percentage</span>
              <span className={`text-lg font-extrabold ${passed ? 'text-green-400' : 'text-red-400'}`}>{session.percentage.toFixed(1)}%</span>
            </div>
            <div>
              <span className="block text-[10px] text-gray-500 uppercase font-semibold">Status</span>
              <span className={`text-sm font-extrabold uppercase px-2 py-0.5 rounded-full ${passed ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {passed ? 'Passed' : 'Failed'}
              </span>
            </div>
          </div>

          <button
            onClick={explainWithAI}
            disabled={generatingAi}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-hub-gold to-hub-aqua text-hub-navy font-bold text-sm rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-hub-gold/25"
          >
            <Sparkles size={15} /> {generatingAi ? 'Analyzing...' : 'Explain with Scolara AI'}
          </button>
        </motion.div>

        {/* AI Explanation Area */}
        {aiExplanation && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-hub-dark-surface border border-hub-gold/30 rounded-3xl mb-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 pointer-events-none">
              <Sparkles size={20} className="text-hub-gold/35" />
            </div>
            <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-hub-gold" /> AI Explanation & Study Recommendations
            </h2>
            <div className="text-sm text-gray-300 leading-relaxed space-y-3 whitespace-pre-wrap">
              {aiExplanation}
            </div>
          </motion.div>
        )}

        {/* Question Review */}
        <h2 className="text-lg font-bold text-white mb-4">Question Review</h2>
        <div className="space-y-4">
          {questions.map((q, qi) => {
            const studentAns = session.answers?.[q.id];
            const correctOpt = q.options.find(o => o.is_correct);
            const isCorrect = correctOpt && studentAns === correctOpt.id;

            return (
              <div key={q.id} className="p-6 bg-hub-dark-surface border border-hub-dark-border rounded-2xl">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-gray-500">QUESTION {qi + 1}</span>
                  <span className={`flex items-center gap-1 text-xs font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {isCorrect ? (
                      <><CheckCircle2 size={13} /> Correct</>
                    ) : (
                      <><XCircle size={13} /> Incorrect</>
                    )}
                  </span>
                </div>

                <p className="text-sm font-semibold text-white mb-4 leading-relaxed">{q.question_text}</p>

                <div className="space-y-2 mb-4">
                  {q.options.map(opt => {
                    const isSelected = studentAns === opt.id;
                    const isCorrectOpt = opt.is_correct;
                    return (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-xs ${
                          isCorrectOpt
                            ? 'bg-green-950/20 border-green-500/30 text-green-400'
                            : isSelected
                            ? 'bg-red-950/20 border-red-500/30 text-red-400'
                            : 'bg-hub-dark-bg border-hub-dark-border text-gray-400'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0 border ${
                          isCorrectOpt ? 'border-green-500 bg-green-500/20' : isSelected ? 'border-red-500 bg-red-500/20' : 'border-gray-600'
                        }`}>
                          {opt.id.toUpperCase()}
                        </div>
                        <span>{opt.text}</span>
                        {isCorrectOpt && <span className="ml-auto text-[10px] font-bold uppercase tracking-wider">Correct</span>}
                        {isSelected && !isCorrectOpt && <span className="ml-auto text-[10px] font-bold uppercase tracking-wider">Your Answer</span>}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="p-4 bg-hub-dark-bg/60 border border-hub-dark-border rounded-xl">
                    <p className="text-xs font-bold text-hub-gold mb-1">Explanation:</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
