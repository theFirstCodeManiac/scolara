import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { FileText, AlertCircle, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export const TopicRanking: React.FC = () => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [topics, setTopics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchTopics = async () => {
      const { data } = await supabase
        .from('extracted_topics')
        .select('*')
        .eq('user_id', user.id)
        .order('weight', { ascending: false });
      setTopics(data || []);
      setIsLoading(false);
    };
    fetchTopics();
  }, [user]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    // For now, show a message. Real OCR/extraction will be wired later.
    setTimeout(() => {
      setIsUploading(false);
      alert('Document uploaded! AI extraction will process this in the background.');
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Topic Ranking</h1>
          <p className="text-gray-500">Upload past questions or notes to extract high-yield topics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Panel */}
        <Card className="col-span-1 p-6 border-dashed border-2 bg-gray-50/50 dark:bg-gray-800/20 text-center flex flex-col justify-center items-center h-64">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <FileText className="text-primary w-8 h-8" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Upload PDF</h3>
          <p className="text-sm text-gray-500 mb-4 px-4">
            Upload past questions or syllabus to analyze topic frequency.
          </p>
          <label className="cursor-pointer">
            <div className="inline-flex items-center justify-center h-10 px-4 py-2 rounded-lg font-medium transition-colors border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary">
              {isUploading ? 'Extracting...' : 'Select File'}
            </div>
            <input type="file" className="hidden" accept=".pdf" onChange={handleUpload} disabled={isUploading} />
          </label>
        </Card>

        {/* Results Panel */}
        <Card className="col-span-1 md:col-span-2 p-6 min-h-[16rem] overflow-y-auto">
          <h3 className="font-semibold text-lg mb-4 flex items-center">
            <BarChart3 className="mr-2 text-primary" size={20} />
            Extracted Topics
          </h3>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-pulse w-6 h-6 bg-primary rounded-full"></div>
            </div>
          ) : topics.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-gray-400">
              <AlertCircle size={32} className="mb-2 opacity-50" />
              <p>No topics extracted yet. Upload a document to begin.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topics.map(topic => (
                <div key={topic.id} className="flex flex-col">
                  <div className="flex justify-between items-end mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{topic.topic_name}</span>
                    <span className="text-sm text-gray-500">Freq: {topic.frequency}</span>
                  </div>
                  <ProgressBar value={topic.weight} color={topic.weight > 80 ? 'danger' : topic.weight > 60 ? 'warning' : 'primary'} />
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>{topic.course_code}</span>
                    <span className="font-semibold">{topic.weight}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
