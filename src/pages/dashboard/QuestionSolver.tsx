import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
// Input removed - unused
import { Brain, Camera, Upload, Sparkles } from 'lucide-react';
import { callGroqApi } from '../../lib/groq';

export const QuestionSolver: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);

  const handleSolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsSolving(true);
    setSolution(null);
    try {
      const prompt = `Solve the following academic question step-by-step. Provide a clear explanation for each step, and highlight the final answer:\n\nQuestion: ${question}`;
      const response = await callGroqApi([{ role: 'user', content: prompt }], 'llama-3.3-70b-versatile');
      setSolution(response);
    } catch (error) {
      console.error(error);
      setSolution("Sorry, I encountered an error while solving this question. Please try again.");
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Question Solver</h1>
          <p className="text-gray-500">Get step-by-step solutions to complex academic problems.</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSolve} className="space-y-4">
          <div className="relative">
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-text dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary min-h-[120px] resize-none"
              placeholder="Type your question here, or paste an equation..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isSolving}
            />
            <div className="absolute bottom-3 right-3 flex gap-2">
              <button type="button" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg transition-colors">
                <Camera size={18} />
              </button>
              <button type="button" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg transition-colors">
                <Upload size={18} />
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" isLoading={isSolving} disabled={!question.trim()}>
              <Sparkles className="mr-2" size={18} />
              Solve Step-by-Step
            </Button>
          </div>
        </form>
      </Card>

      {solution && (
        <Card className="p-6 border-primary/20 bg-primary/5 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 mb-4 text-primary-dark">
            <Brain size={24} />
            <h2 className="text-xl font-bold">Solution</h2>
          </div>
          <div className="prose dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{solution}</p>
          </div>
        </Card>
      )}
    </div>
  );
};
