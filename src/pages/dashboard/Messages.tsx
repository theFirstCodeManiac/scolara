import React from 'react';
import { Card } from '../../components/ui/Card';
import { MessageSquare } from 'lucide-react';

export const Messages: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
          <p className="text-gray-500">Chat with classmates and study groups.</p>
        </div>
      </div>

      <Card className="p-6 sm:p-16 text-center">
        <div className="mx-auto w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <MessageSquare size={40} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          No messages yet
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Your conversations with classmates and study groups will appear here. Start a conversation by connecting with students from your department.
        </p>
      </Card>
    </div>
  );
};
