import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { TrendingUp, Award, Calendar, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export const Progress: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchProgressData = async () => {
      // Fetch past 28 days sessions
      const twentyEightDaysAgo = new Date();
      twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);
      const { data: sess } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', twentyEightDaysAgo.toISOString());
      
      setSessions(sess || []);

      // Fetch extracted topics for mastery
      const { data: tops } = await supabase
        .from('extracted_topics')
        .select('*')
        .eq('user_id', user.id);
      setTopics(tops || []);
      
      setIsLoading(false);
    };
    fetchProgressData();
  }, [user]);

  // Heatmap generation
  const today = new Date();
  const calendarDays = Array.from({ length: 28 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (27 - i));
    
    // Check if there was a session on this day
    const hasSession = sessions.some(s => {
      const sessDate = new Date(s.created_at);
      return sessDate.toDateString() === d.toDateString();
    });

    return {
      date: d,
      active: hasSession
    };
  });

  // Calculate stats
  const totalMinutes = sessions.reduce((acc, curr) => acc + curr.duration_minutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Group topics by course to show course mastery
  const coursesMap: Record<string, { totalWeight: number, count: number }> = {};
  topics.forEach(t => {
    if (!coursesMap[t.course_code]) {
      coursesMap[t.course_code] = { totalWeight: 0, count: 0 };
    }
    coursesMap[t.course_code].totalWeight += t.weight;
    coursesMap[t.course_code].count += 1;
  });

  const courseMasteryList = Object.entries(coursesMap).map(([course, data]) => ({
    course,
    percentage: Math.round(data.totalWeight / data.count)
  }));

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progress Tracking</h1>
          <p className="text-gray-500">Monitor your learning journey and study consistency.</p>
        </div>
      </div>

      {sessions.length === 0 && topics.length === 0 ? (
        <Card className="p-6 sm:p-16 text-center">
          <div className="mx-auto w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
            <TrendingUp size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No progress tracked yet
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Start a focus session using Pomodoro Focus Mode or upload past questions to start building your academic progress profile.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <TrendingUp className="mr-2 text-primary" size={20} />
                Focus Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-primary">{totalHours}h</p>
                  <p className="text-xs text-gray-500 mt-1">total focus time</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-accent">{sessions.length}</p>
                  <p className="text-xs text-gray-500 mt-1">sessions completed</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <Calendar className="mr-2 text-accent" size={20} />
                Study Consistency Heatmap (Past 28 Days)
              </h3>
              <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="grid grid-cols-7 gap-2 min-w-[280px]">
                  {calendarDays.map((day, i) => (
                    <div 
                      key={i} 
                      className={`aspect-square rounded-md flex flex-col justify-end p-1 transition-all ${
                        day.active 
                          ? 'bg-accent border border-accent-dark shadow-sm' 
                          : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                      }`}
                      title={day.date.toDateString()}
                    >
                      <span className={`text-[10px] self-end font-semibold ${day.active ? 'text-white' : 'text-gray-400'}`}>
                        {day.date.getDate()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <Award className="mr-2 text-yellow-500" size={20} />
                Course Mastery
              </h3>
              {courseMasteryList.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Sparkles className="mx-auto mb-2 opacity-50" size={24} />
                  <p className="text-sm">Upload past questions to analyze course mastery.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {courseMasteryList.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">{item.course}</span>
                        <span>{item.percentage}%</span>
                      </div>
                      <ProgressBar value={item.percentage} color={item.percentage > 75 ? 'success' : item.percentage > 45 ? 'warning' : 'danger'} />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
