import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Calendar as CalendarIcon, Settings, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export const StudyPlan: React.FC = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePlan, setActivePlan] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchPlan = async () => {
      const { data } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      setActivePlan(data);
      setIsLoading(false);
    };
    fetchPlan();
  }, [user]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsGenerating(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const { error } = await supabase.from('study_plans').insert({
      user_id: user.id,
      exam_date: formData.get('exam_date'),
      hours_per_day: parseInt(formData.get('hours_per_day') as string),
      pacing: formData.get('pacing') || 'balanced',
      weak_topics: (formData.get('weak_topics') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
      is_active: true,
    });

    if (!error) {
      // Refetch the active plan
      const { data } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      setActivePlan(data);
    }
    setIsGenerating(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-pulse w-8 h-8 bg-primary rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Study Plan Generator</h1>
          <p className="text-gray-500">Create an adaptive study schedule based on your exams and weak points.</p>
        </div>
      </div>

      {!activePlan ? (
        <Card className="max-w-2xl mx-auto p-8">
          <div className="flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-6 mx-auto">
            <Sparkles size={32} />
          </div>
          <h2 className="text-xl font-bold text-center mb-6">Generate New Plan</h2>
          
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Target Exam Date" type="date" name="exam_date" required />
              <Input label="Available Hours per Day" type="number" name="hours_per_day" min="1" max="16" defaultValue="3" required />
            </div>
            
            <Select 
              label="Difficulty Pacing"
              name="pacing"
              options={[
                { value: 'balanced', label: 'Balanced (Recommended)' },
                { value: 'intensive', label: 'Intensive (Fast-paced)' },
                { value: 'relaxed', label: 'Relaxed (More breaks)' },
              ]}
            />

            <Input 
              label="Weak Topics (Comma separated)" 
              name="weak_topics"
              placeholder="e.g., Recursion, Thermodynamics" 
            />

            <Button type="submit" className="w-full h-12 text-lg" isLoading={isGenerating}>
              {isGenerating ? 'Generating Adaptive Plan...' : 'Generate Plan'}
            </Button>
          </form>
        </Card>
      ) : (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex justify-between items-center bg-primary/10 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-3 text-primary-dark">
              <CalendarIcon />
              <span className="font-medium">Plan active until {new Date(activePlan.exam_date).toLocaleDateString()}</span>
            </div>
            <Button variant="outline" size="sm" onClick={async () => {
              await supabase.from('study_plans').update({ is_active: false }).eq('id', activePlan.id);
              setActivePlan(null);
            }}>
              <Settings size={16} className="mr-2" />
              Reconfigure
            </Button>
          </div>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Plan Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">{activePlan.hours_per_day}h</p>
                <p className="text-xs text-gray-500 mt-1">per day</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-accent capitalize">{activePlan.pacing}</p>
                <p className="text-xs text-gray-500 mt-1">pacing</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600">{activePlan.weak_topics?.length || 0}</p>
                <p className="text-xs text-gray-500 mt-1">weak topics</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">Active</p>
                <p className="text-xs text-gray-500 mt-1">status</p>
              </div>
            </div>
            {activePlan.weak_topics?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500 mb-2">Focus areas:</p>
                <div className="flex flex-wrap gap-2">
                  {activePlan.weak_topics.map((t: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
