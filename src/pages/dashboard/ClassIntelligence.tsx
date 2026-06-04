import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Users, TrendingUp, AlertTriangle, MessageSquare, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export const ClassIntelligence: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchClassData = async () => {
      // Fetch students in the same department
      const { data: stds } = await supabase
        .from('profiles')
        .select('*')
        .eq('university', user.university)
        .eq('department', user.department);
      
      setStudents(stds || []);

      if (stds && stds.length > 0) {
        const studentIds = stds.map(s => s.id);
        
        // Fetch topics extracted by anyone in this department
        const { data: tops } = await supabase
          .from('extracted_topics')
          .select('*')
          .in('user_id', studentIds);
        
        setTopics(tops || []);
      }

      setIsLoading(false);
    };
    fetchClassData();
  }, [user]);

  // Aggregate struggle topics
  const struggledTopicsMap: Record<string, { totalWeight: number, count: number, course: string }> = {};
  topics.forEach(t => {
    if (!struggledTopicsMap[t.topic_name]) {
      struggledTopicsMap[t.topic_name] = { totalWeight: 0, count: 0, course: t.course_code };
    }
    struggledTopicsMap[t.topic_name].totalWeight += t.weight;
    struggledTopicsMap[t.topic_name].count += 1;
  });

  const struggleTopics = Object.entries(struggledTopicsMap)
    .map(([name, data]) => ({
      name,
      course: data.course,
      percentage: Math.round(data.totalWeight / data.count)
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-pulse w-8 h-8 bg-primary rounded-full"></div>
      </div>
    );
  }

  // If there are no other students in this department
  const totalStudents = students.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Class Intelligence</h1>
          <p className="text-gray-500">Analytics and insights for Class Representatives in {user?.department}.</p>
        </div>
      </div>

      {totalStudents <= 1 ? (
        <Card className="p-16 text-center">
          <div className="mx-auto w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
            <Users size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No other students registered yet
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Once other students from {user?.university}'s {user?.department} department sign up on Scolara, their aggregated study metrics, focus statistics, and analytics will populate this Class Intelligence dashboard automatically.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 border-l-4 border-l-primary">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-gray-500 font-medium">Department Students</h3>
                <Users className="text-primary" size={20} />
              </div>
              <div className="text-3xl font-bold mb-1">{totalStudents}</div>
              <p className="text-sm text-gray-500">Registered on Scolara</p>
            </Card>

            <Card className="p-6 border-l-4 border-l-red-500">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-gray-500 font-medium">Total Extracted Topics</h3>
                <AlertTriangle className="text-red-500" size={20} />
              </div>
              <div className="text-3xl font-bold mb-1">{topics.length}</div>
              <p className="text-sm text-gray-500">Across all students</p>
            </Card>

            <Card className="p-6 border-l-4 border-l-accent">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-gray-500 font-medium">Avg Topic Weight</h3>
                <TrendingUp className="text-accent" size={20} />
              </div>
              <div className="text-3xl font-bold mb-1">
                {topics.length > 0 
                  ? `${Math.round(topics.reduce((acc, curr) => acc + curr.weight, 0) / topics.length)}%`
                  : 'N/A'}
              </div>
              <ProgressBar 
                value={topics.length > 0 ? (topics.reduce((acc, curr) => acc + curr.weight, 0) / topics.length) : 0} 
                color="accent" 
                className="mt-2" 
              />
            </Card>

            <Card className="p-6 border-l-4 border-l-blue-500">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-gray-500 font-medium">Verified Class Representative</h3>
                <MessageSquare className="text-blue-500" size={20} />
              </div>
              <div className="text-md font-bold mb-1 mt-2 text-primary">{user?.first_name || user?.full_name}</div>
              <p className="text-sm text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Commonly Extracted Topics in Class</h3>
              {struggleTopics.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Sparkles className="mx-auto mb-2 opacity-50" size={24} />
                  <p className="text-sm">No topics have been extracted by your classmates yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {struggleTopics.map((topic, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-sm text-gray-900 dark:text-white">{topic.name} ({topic.course})</span>
                        <span className="text-sm text-gray-500">Recurrence: {topic.percentage}%</span>
                      </div>
                      <ProgressBar value={topic.percentage} color="warning" />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-primary">Academic Network Active</span>
                    <span className="text-xs text-gray-500">Just now</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Scolara has securely mapped your class hierarchy under {user?.university} to automatically pool analytics and insights anonymously.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
