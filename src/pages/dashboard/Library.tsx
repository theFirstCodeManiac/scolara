import React from 'react';
import { Card } from '../../components/ui/Card';
import { Upload, FolderOpen } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const Library: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Library</h1>
          <p className="text-gray-500">Your uploaded documents, notes, and study materials.</p>
        </div>
        <Button>
          <Upload className="mr-2" size={18} />
          Upload Document
        </Button>
      </div>

      <Card className="p-6 sm:p-16 text-center">
        <div className="mx-auto w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <FolderOpen size={40} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Your library is empty
        </h3>
        <p className="text-gray-500 max-w-md mx-auto mb-6">
          Upload past questions, lecture notes, or syllabi to start building your personal academic library. Scolara's AI will analyze your materials to extract topics and generate predictions.
        </p>
        <Button variant="outline">
          <Upload className="mr-2" size={18} />
          Upload Your First Document
        </Button>
      </Card>
    </div>
  );
};
