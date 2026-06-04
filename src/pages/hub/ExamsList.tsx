import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Clock, Target, Plus, Calendar, CheckCircle,
  Lock, Award, X, Trash2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useHub } from '../../context/HubContext';

interface Exam {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  duration_minutes: number;
  pass_mark: number;
  total_marks: number;
  subject?: string;
  start_at?: string;
  end_at?: string;
  is_published: boolean;
  created_at: string;
}

interface ExamsListProps {
  groupId: string;
  isTutor?: boolean;
}

export const ExamsList: React.FC<ExamsListProps> = ({ groupId, isTutor }) => {
  const { hubUser } = useHub();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [sessions, setSessions] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Create form
  const [form, setForm] = useState({
    title: '', description: '', instructions: '', duration_minutes: 60,
    pass_mark: 50, total_marks: 100, subject: '', start_at: '', end_at: '',
  });
  const [questions, setQuestions] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchExams(); }, [groupId]);

  const fetchExams = async () => {
    setLoading(true);
    let query = supabase.from('hub_exams').select('*').eq('group_id', groupId).order('created_at', { ascending: false });
    if (!isTutor) query = query.eq('is_published', true);
    const { data } = await query;
    setExams(data || []);

    // Get student's session statuses
    if (hubUser && !isTutor) {
      const { data: sessData } = await supabase
        .from('hub_exam_sessions')
        .select('exam_id, status, score, percentage, submitted_at')
        .eq('student_id', hubUser.id)
        .in('exam_id', (data || []).map((e: Exam) => e.id));
      const sessMap: Record<string, any> = {};
      (sessData || []).forEach((s: any) => { sessMap[s.exam_id] = s; });
      setSessions(sessMap);
    }
    setLoading(false);
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      question_text: '',
      question_type: 'mcq',
      options: [{ id: 'a', text: '', is_correct: false }, { id: 'b', text: '', is_correct: false }, { id: 'c', text: '', is_correct: false }, { id: 'd', text: '', is_correct: false }],
      correct_answer: '',
      explanation: '',
      points: 1,
    }]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q));
  };

  const updateOption = (qIndex: number, optId: string, text: string) => {
    setQuestions(prev => prev.map((q, i) => i === qIndex ? {
      ...q,
      options: q.options.map((o: any) => o.id === optId ? { ...o, text } : o),
    } : q));
  };

  const setCorrectAnswer = (qIndex: number, optId: string) => {
    setQuestions(prev => prev.map((q, i) => i === qIndex ? {
      ...q,
      correct_answer: optId,
      options: q.options.map((o: any) => ({ ...o, is_correct: o.id === optId })),
    } : q));
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hubUser || !form.title || questions.length === 0) return;
    setCreating(true);

    const { data: tutorData } = await supabase.from('hub_tutors').select('id').eq('user_id', hubUser.id).single();
    if (!tutorData) { setCreating(false); return; }

    const { data: examData, error } = await supabase.from('hub_exams').insert({
      group_id: groupId,
      tutor_id: tutorData.id,
      ...form,
      duration_minutes: Number(form.duration_minutes),
      pass_mark: Number(form.pass_mark),
      total_marks: Number(form.total_marks),
      start_at: form.start_at || null,
      end_at: form.end_at || null,
      is_published: true,
    }).select().single();

    if (!error && examData) {
      const questionsToInsert = questions.map((q, i) => ({
        exam_id: examData.id,
        ...q,
        order_index: i,
      }));
      await supabase.from('hub_questions').insert(questionsToInsert);
    }

    setCreating(false);
    setShowCreate(false);
    setForm({ title: '', description: '', instructions: '', duration_minutes: 60, pass_mark: 50, total_marks: 100, subject: '', start_at: '', end_at: '' });
    setQuestions([]);
    fetchExams();
  };

  const startExam = async (exam: Exam) => {
    if (!hubUser) return;
    const existing = sessions[exam.id];
    if (existing?.status === 'in_progress') {
      navigate(`/hub/exam/${exam.id}`);
      return;
    }
    if (existing?.status === 'submitted') {
      navigate(`/hub/exam/${exam.id}/results`);
      return;
    }
    // Create session
    await supabase.from('hub_exam_sessions').insert({
      exam_id: exam.id,
      student_id: hubUser.id,
      status: 'in_progress',
    });
    navigate(`/hub/exam/${exam.id}`);
  };

  const getExamStatus = (exam: Exam) => {
    const now = new Date();
    if (exam.start_at && new Date(exam.start_at) > now) return 'upcoming';
    if (exam.end_at && new Date(exam.end_at) < now) return 'ended';
    return 'live';
  };

  const inputClass = "w-full bg-hub-dark-bg border border-hub-dark-border rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-hub-gold/40";

  return (
    <div className="p-4 md:p-6 bg-hub-dark-bg min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-white">Mock Examinations</h2>
          <p className="text-sm text-gray-500">{exams.length} exam{exams.length !== 1 ? 's' : ''} available</p>
        </div>
        {isTutor && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2 bg-hub-gold text-hub-navy font-bold text-sm rounded-xl hover:bg-hub-gold-dark transition-all"
          >
            <Plus size={15} /> Create Exam
          </button>
        )}
      </div>

      {/* Create Exam Form */}
      {showCreate && isTutor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 bg-hub-dark-surface border border-hub-dark-border rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-5 border-b border-hub-dark-border">
            <h3 className="font-bold text-white flex items-center gap-2"><Zap size={16} className="text-hub-gold" /> Create New Exam</h3>
            <button onClick={() => setShowCreate(false)}><X size={16} className="text-gray-500" /></button>
          </div>
          <form onSubmit={handleCreateExam} className="p-5 space-y-4">
            {/* Basic info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="col-span-2">
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Exam title *" required className={inputClass} />
              </div>
              <div className="col-span-2">
                <textarea value={form.instructions} onChange={e => setForm({...form, instructions: e.target.value})} placeholder="Instructions for students" rows={2} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Duration (minutes)</label>
                <input type="number" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: parseInt(e.target.value)})} min={1} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Pass Mark (%)</label>
                <input type="number" value={form.pass_mark} onChange={e => setForm({...form, pass_mark: parseInt(e.target.value)})} min={0} max={100} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Subject</label>
                <input type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="e.g. Mathematics" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Total Marks</label>
                <input type="number" value={form.total_marks} onChange={e => setForm({...form, total_marks: parseInt(e.target.value)})} min={1} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Start Date & Time</label>
                <input type="datetime-local" value={form.start_at} onChange={e => setForm({...form, start_at: e.target.value})} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">End Date & Time</label>
                <input type="datetime-local" value={form.end_at} onChange={e => setForm({...form, end_at: e.target.value})} className={inputClass} />
              </div>
            </div>

            {/* Questions */}
            <div className="border-t border-hub-dark-border pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white text-sm">Questions ({questions.length})</h4>
                <button type="button" onClick={addQuestion} className="flex items-center gap-1 text-xs text-hub-gold hover:underline">
                  <Plus size={13} /> Add Question
                </button>
              </div>
              <div className="space-y-4">
                {questions.map((q, qi) => (
                  <div key={qi} className="p-4 bg-hub-dark-bg border border-hub-dark-border rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-hub-gold">Question {qi + 1}</span>
                      <div className="flex items-center gap-2">
                        <select value={q.question_type} onChange={e => updateQuestion(qi, 'question_type', e.target.value)} className="text-xs bg-hub-dark-surface border border-hub-dark-border rounded-lg px-2 py-1 text-gray-400">
                          <option value="mcq">Multiple Choice</option>
                          <option value="true_false">True / False</option>
                          <option value="short_answer">Short Answer</option>
                          <option value="essay">Essay</option>
                        </select>
                        <button type="button" onClick={() => setQuestions(prev => prev.filter((_, i) => i !== qi))} className="text-gray-600 hover:text-red-400">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={q.question_text}
                      onChange={e => updateQuestion(qi, 'question_text', e.target.value)}
                      placeholder="Question text..."
                      rows={2}
                      className={`${inputClass} resize-none mb-3`}
                    />
                    {q.question_type === 'mcq' && (
                      <div className="space-y-2">
                        {q.options.map((opt: any) => (
                          <div key={opt.id} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setCorrectAnswer(qi, opt.id)}
                              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${q.correct_answer === opt.id ? 'border-hub-gold bg-hub-gold' : 'border-gray-600'}`}
                            />
                            <span className="text-xs text-gray-500 font-mono">{opt.id.toUpperCase()}.</span>
                            <input
                              type="text"
                              value={opt.text}
                              onChange={e => updateOption(qi, opt.id, e.target.value)}
                              placeholder={`Option ${opt.id.toUpperCase()}`}
                              className="flex-1 bg-hub-dark-surface border border-hub-dark-border rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-hub-gold/30"
                            />
                          </div>
                        ))}
                        <p className="text-[10px] text-gray-600">Click the circle to mark the correct answer</p>
                      </div>
                    )}
                    {q.question_type === 'true_false' && (
                      <div className="flex gap-3">
                        {['true', 'false'].map(v => (
                          <button key={v} type="button" onClick={() => updateQuestion(qi, 'correct_answer', v)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all capitalize ${q.correct_answer === v ? 'bg-hub-gold text-hub-navy border-hub-gold' : 'bg-hub-dark-surface text-gray-400 border-hub-dark-border'}`}>
                            {v}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="mt-3">
                      <textarea
                        value={q.explanation}
                        onChange={e => updateQuestion(qi, 'explanation', e.target.value)}
                        placeholder="Explanation (shown after submission)"
                        rows={2}
                        className={`${inputClass} resize-none text-xs`}
                      />
                    </div>
                  </div>
                ))}
                {questions.length === 0 && (
                  <div className="text-center py-8 border border-dashed border-hub-dark-border rounded-xl">
                    <p className="text-sm text-gray-600 mb-2">No questions yet</p>
                    <button type="button" onClick={addQuestion} className="text-hub-gold text-sm hover:underline">Add first question</button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={creating || questions.length === 0}
                className="px-6 py-2.5 bg-hub-gold text-hub-navy font-bold text-sm rounded-xl hover:bg-hub-gold-dark disabled:opacity-60 transition-all">
                {creating ? 'Creating...' : `Publish Exam (${questions.length} questions)`}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="px-6 py-2.5 border border-hub-dark-border text-gray-400 text-sm rounded-xl hover:text-white">
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Exams List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-hub-dark-surface border border-hub-dark-border rounded-2xl animate-pulse" />)}
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-16">
          <Zap size={32} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 font-medium mb-1">No exams yet</p>
          <p className="text-sm text-gray-600">{isTutor ? 'Click "Create Exam" to publish your first mock test.' : 'The tutor hasn\'t created any exams yet.'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {exams.map((exam, i) => {
            const session = sessions[exam.id];
            const status = getExamStatus(exam);
            const submitted = session?.status === 'submitted';
            const inProgress = session?.status === 'in_progress';

            return (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-5 border rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center transition-all ${
                  submitted ? 'bg-green-900/10 border-green-700/25' : inProgress ? 'bg-hub-gold/5 border-hub-gold/20' : 'bg-hub-dark-surface border-hub-dark-border hover:border-hub-aqua/30'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: submitted ? 'rgba(34,197,94,0.15)' : 'rgba(244,211,94,0.1)' }}>
                  {submitted ? <Award size={22} className="text-green-400" /> : <Zap size={22} className="text-hub-gold" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-white">{exam.title}</h3>
                    {!exam.is_published && <span className="text-[10px] bg-yellow-900/30 text-yellow-400 border border-yellow-700/30 px-2 py-0.5 rounded-full">Draft</span>}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                      status === 'live' ? 'bg-green-900/20 text-green-400 border-green-700/30' :
                      status === 'upcoming' ? 'bg-hub-aqua/10 text-hub-aqua border-hub-aqua/20' :
                      'bg-gray-900/20 text-gray-500 border-gray-700/30'
                    }`}>
                      {status === 'live' ? '🟢 Live' : status === 'upcoming' ? '⏰ Upcoming' : '🔴 Ended'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1"><Clock size={11} /> {exam.duration_minutes} min</span>
                    <span className="flex items-center gap-1"><Target size={11} /> Pass: {exam.pass_mark}%</span>
                    {exam.subject && <span className="flex items-center gap-1"><Award size={11} /> {exam.subject}</span>}
                    {exam.start_at && <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(exam.start_at).toLocaleDateString()}</span>}
                  </div>
                  {submitted && session?.percentage !== undefined && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-hub-dark-bg rounded-full overflow-hidden max-w-xs">
                        <div className="h-full bg-hub-gold rounded-full transition-all" style={{ width: `${session.percentage}%` }} />
                      </div>
                      <span className="text-xs font-bold text-hub-gold">{session.percentage?.toFixed(1)}%</span>
                      {session.percentage >= exam.pass_mark ? (
                        <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle size={11} /> Passed</span>
                      ) : (
                        <span className="text-xs text-red-400">Failed</span>
                      )}
                    </div>
                  )}
                </div>

                {!isTutor && (
                  <div className="flex-shrink-0">
                    {submitted ? (
                      <button
                        onClick={() => navigate(`/hub/exam/${exam.id}/results`)}
                        className="px-4 py-2 bg-green-900/20 text-green-400 border border-green-700/30 text-sm font-semibold rounded-xl hover:bg-green-900/30 transition-all"
                      >
                        View Results
                      </button>
                    ) : inProgress ? (
                      <button
                        onClick={() => navigate(`/hub/exam/${exam.id}`)}
                        className="px-4 py-2 bg-hub-gold text-hub-navy font-bold text-sm rounded-xl hover:bg-hub-gold-dark transition-all animate-pulse"
                      >
                        Continue →
                      </button>
                    ) : status === 'ended' ? (
                      <span className="text-sm text-gray-600 italic">Exam closed</span>
                    ) : status === 'upcoming' ? (
                      <span className="flex items-center gap-1 text-sm text-hub-aqua"><Lock size={13} /> Not started</span>
                    ) : (
                      <button
                        onClick={() => startExam(exam)}
                        className="px-4 py-2 bg-hub-gold text-hub-navy font-bold text-sm rounded-xl hover:bg-hub-gold-dark transition-all shadow-lg shadow-hub-gold/20"
                      >
                        Start Exam →
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
