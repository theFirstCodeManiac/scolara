import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Bot, Trash2, ShieldAlert, Brain } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useHub } from '../../context/HubContext';
import { callGroqApi } from '../../lib/groq';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const HubAI: React.FC = () => {
  const { hubUser } = useHub();

  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [examStats, setExamStats] = useState<any[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Welcome message
    setChatHistory([
      {
        role: 'assistant',
        content: `Hello ${hubUser?.aspirant?.full_name || 'Aspirant'}! I am your Scolara AI Coach. I can help you:
- Create custom study plans
- Explain complex UTME topics
- Analyze your mock exam scores to identify weak points
- Suggest past questions to solve

What subject are we focus on today?`,
      },
    ]);
    fetchPerformanceData();
  }, [hubUser]);

  const fetchPerformanceData = async () => {
    if (!hubUser) return;
    const { data: sessions } = await supabase
      .from('hub_exam_sessions')
      .select('*, hub_exams(*)')
      .eq('student_id', hubUser.id)
      .eq('status', 'submitted');

    if (sessions && sessions.length > 0) {
      setExamStats(sessions);
      // Determine weak subjects/topics where score is below 60%
      const weak = sessions
        .filter(s => s.percentage < 60)
        .map(s => s.hub_exams?.subject)
        .filter(Boolean);
      setWeakTopics([...new Set(weak)] as string[]);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;
    const userMessage: Message = { role: 'user', content: inputText.trim() };
    const updatedHistory = [...chatHistory, userMessage];

    setChatHistory(updatedHistory);
    setInputText('');
    setLoading(true);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    const contextPrompt: Message = {
      role: 'system',
      content: `You are Scolara AI, an expert tutor specialized in preparing Nigerian students for university entrance examinations (Post-UTME).
Current Student Info:
Name: ${hubUser?.aspirant?.full_name || 'Aspirant'}
Weak Areas: ${weakTopics.join(', ') || 'None recorded yet'}
Performance History: ${JSON.stringify(
        examStats.map(s => ({ title: s.hub_exams?.title, score: s.percentage }))
      )}

Provide highly pedagogical explanations, structure answers clearly, and provide encouragement.`,
    };

    try {
      const apiMessages = [contextPrompt, ...updatedHistory];
      const aiResponse = await callGroqApi(apiMessages);
      setChatHistory(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (e) {
      setChatHistory(prev => [
        ...prev,
        { role: 'assistant', content: 'Apologies, I encountered an issue processing that. Please try again.' },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const clearChat = () => {
    if (window.confirm('Clear conversation history?')) {
      setChatHistory([
        {
          role: 'assistant',
          content: 'Chat history cleared. How can I assist you with your Post-UTME preparation today?',
        },
      ]);
    }
  };

  // inputClass removed - unused

  return (
    <div className="bg-hub-dark-bg min-h-screen p-4 md:p-8 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col bg-hub-dark-surface border border-hub-dark-border rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-hub-dark-border flex items-center justify-between bg-hub-dark-surface/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-hub-gold to-hub-aqua flex items-center justify-center">
              <Brain size={22} className="text-hub-navy" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base flex items-center gap-1.5">
                Scolara AI Coach <Sparkles size={14} className="text-hub-gold" />
              </h1>
              <p className="text-xs text-gray-500">Personalized study support & weak area tutor</p>
            </div>
          </div>
          <button onClick={clearChat} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>

        {/* Weak topic warning overlay */}
        {weakTopics.length > 0 && (
          <div className="px-6 py-2 bg-yellow-950/20 border-b border-hub-dark-border flex items-center gap-2 text-xs text-yellow-500">
            <ShieldAlert size={14} />
            <span>AI identified weak areas: <span className="font-bold text-white">{weakTopics.join(', ')}</span>. Tap below to ask for a custom study plan.</span>
          </div>
        )}

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[500px]">
          {chatHistory.map((m, i) => {
            const assistant = m.role === 'assistant';
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3.5 ${assistant ? 'justify-start' : 'justify-end'}`}
              >
                {assistant && (
                  <div className="w-8 h-8 rounded-full bg-hub-navy flex items-center justify-center text-hub-gold font-bold text-xs flex-shrink-0">
                    <Bot size={16} />
                  </div>
                )}
                <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[80%] whitespace-pre-wrap ${
                  assistant
                    ? 'bg-hub-dark-bg text-gray-200 border border-hub-dark-border rounded-tl-sm'
                    : 'bg-hub-gold text-hub-navy font-medium rounded-tr-sm'
                }`}>
                  {m.content}
                </div>
              </motion.div>
            );
          })}
          {loading && (
            <div className="flex gap-3.5 justify-start">
              <div className="w-8 h-8 rounded-full bg-hub-navy flex items-center justify-center text-hub-gold font-bold text-xs flex-shrink-0 animate-pulse">
                <Bot size={16} />
              </div>
              <div className="bg-hub-dark-bg text-gray-500 border border-hub-dark-border rounded-2xl rounded-tl-sm p-4 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-hub-dark-border bg-hub-dark-surface/20">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything (e.g. 'Explain Quadratic equations' or 'Create a Math study plan')"
              disabled={loading}
              className="flex-1 bg-hub-dark-surface border border-hub-dark-border rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={loading || !inputText.trim()}
              className="p-3.5 bg-hub-gold text-hub-navy rounded-xl hover:bg-hub-gold-dark transition-all disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
