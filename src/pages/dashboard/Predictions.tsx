import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Brain, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export const Predictions: React.FC = () => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchPredictions = async () => {
      const { data } = await supabase
        .from('exam_predictions')
        .select('*')
        .eq('user_id', user.id)
        .order('probability', { ascending: false });
      setPredictions(data || []);
      setIsLoading(false);
    };
    fetchPredictions();
  }, [user]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exam Predictions</h1>
          <p className="text-gray-500">AI-powered likelihood of topics appearing in upcoming exams.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-pulse w-8 h-8 bg-primary rounded-full"></div>
        </div>
      ) : predictions.length === 0 ? (
        <Card className="p-16 text-center">
          <div className="mx-auto w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
            <Brain size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No predictions yet
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Upload past questions on the Topic Ranking page first. Once Scolara has analyzed your materials, predictions will appear here automatically.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {predictions.map((pred) => (
              <Card key={pred.id} className="p-4" hoverable>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                      pred.probability > 80 ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                      pred.probability > 60 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30' :
                      'bg-primary/10 text-primary-dark dark:text-primary-light'
                    }`}>
                      {pred.probability}%
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{pred.topic_name}</h3>
                      <p className="text-sm text-gray-500">{pred.course_code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="flex items-center text-sm font-medium text-gray-500">
                      Trend
                      {pred.trend === 'up' && <TrendingUp size={16} className="ml-1 text-red-500" />}
                      {pred.trend === 'down' && <TrendingUp size={16} className="ml-1 text-green-500 transform rotate-180" />}
                      {pred.trend === 'flat' && <span className="ml-1 text-gray-400">-</span>}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <ProgressBar value={pred.probability} color={pred.probability > 80 ? 'danger' : pred.probability > 60 ? 'warning' : 'primary'} />
                </div>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-none">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="text-primary" />
                <h3 className="font-semibold text-lg">How it works</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                Our Prediction Engine analyzes historical exam data, curriculum weighting, and professor patterns to calculate the probability of specific topics appearing.
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
