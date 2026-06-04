import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Play, Pause, RotateCcw, Coffee, Target } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export const FocusMode: React.FC = () => {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      
      // Log session to Supabase when session completes
      const logSession = async () => {
        if (!user) return;
        const duration = mode === 'focus' ? 25 : 5;
        await supabase.from('study_sessions').insert({
          user_id: user.id,
          duration_minutes: duration,
          session_type: mode
        });
      };
      
      logSession();

      if (mode === 'focus') {
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('focus');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, user]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const maxTime = mode === 'focus' ? 25 * 60 : 5 * 60;
  const strokeDashoffset = circumference - (timeLeft / maxTime) * circumference;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Focus Mode</h1>
          <p className="text-gray-500">Pomodoro timer for maximum productivity.</p>
        </div>
      </div>

      <Card className="p-6 sm:p-12 flex flex-col items-center justify-center">
        <div className="flex gap-4 mb-8">
          <Button 
            variant={mode === 'focus' ? 'primary' : 'ghost'} 
            onClick={() => { setMode('focus'); setTimeLeft(25 * 60); setIsActive(false); }}
          >
            <Target className="mr-2" size={18} /> Focus
          </Button>
          <Button 
            variant={mode === 'break' ? 'primary' : 'ghost'} 
            onClick={() => { setMode('break'); setTimeLeft(5 * 60); setIsActive(false); }}
          >
            <Coffee className="mr-2" size={18} /> Break
          </Button>
        </div>

        <div className="relative flex items-center justify-center mb-8 w-full max-w-[288px] aspect-square">
          <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 288 288">
            <circle
              cx="144" cy="144" r={radius}
              stroke="currentColor" strokeWidth="8" fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="144" cy="144" r={radius}
              stroke="currentColor" strokeWidth="8" fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`transition-all duration-1000 ${mode === 'focus' ? 'text-primary' : 'text-green-500'}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white font-mono">
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="flex gap-4">
          <Button size="lg" onClick={toggleTimer} className="w-32">
            {isActive ? <><Pause className="mr-2" /> Pause</> : <><Play className="mr-2" /> Start</>}
          </Button>
          <Button size="lg" variant="outline" onClick={resetTimer}>
            <RotateCcw className="mr-2" /> Reset
          </Button>
        </div>
      </Card>
    </div>
  );
};
