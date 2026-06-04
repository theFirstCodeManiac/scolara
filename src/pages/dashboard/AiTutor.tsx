import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Avatar } from '../../components/ui/Avatar';
import { Brain, Send, Paperclip, X, FileText } from 'lucide-react';
import { callGroqApi } from '../../lib/groq';
import { useAuth } from '../../context/AuthContext';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  attachmentName?: string;
};

export const AiTutor: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your Scolara AI Tutor. You can ask me anything, or attach a PDF/document to discuss its contents." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('standard');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractTextFromFile = async (file: File): Promise<string> => {
    // For plain text files, just read them directly
    if (file.type === 'text/plain') {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string || '');
        reader.readAsText(file);
      });
    }

    // For PDFs: use FileReader to read as text (basic extraction)
    // Groq supports text in messages, so we'll do basic text extraction
    if (file.type === 'application/pdf') {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            // Try reading PDF as ArrayBuffer and extracting readable text
            const buffer = e.target?.result as ArrayBuffer;
            const bytes = new Uint8Array(buffer);
            // Decode PDF stream text — grab readable ASCII characters
            let text = '';
            for (let i = 0; i < bytes.length; i++) {
              const c = bytes[i];
              if (c >= 32 && c <= 126) {
                text += String.fromCharCode(c);
              } else if (c === 10 || c === 13) {
                text += '\n';
              }
            }
            // Clean up extracted text (remove PDF noise)
            const cleaned = text
              .replace(/[^\x20-\x7E\n]/g, ' ')
              .replace(/\s{3,}/g, '\n')
              .replace(/^obj\s|endobj|stream|endstream/gm, '')
              .substring(0, 8000); // Keep within context window
            resolve(cleaned);
          } catch {
            resolve('');
          }
        };
        reader.readAsArrayBuffer(file);
      });
    }

    return '';
  };

  const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachedFile(file);
    setIsExtracting(true);

    const text = await extractTextFromFile(file);
    setPdfText(text);
    setIsExtracting(false);

    if (!text.trim()) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I've received your file "${file.name}". The text extraction was limited — please type your specific question about the content and I'll do my best to help!`
      }]);
    } else {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `📄 I've read **${file.name}**. I extracted ${text.length.toLocaleString()} characters of content. What would you like to know about it? I can summarize it, explain concepts, generate exam questions, or highlight key topics.`,
        attachmentName: file.name
      }]);
    }
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    setPdfText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      let systemPrompt = `You are an expert AI tutor for university students in Nigeria. 
You are knowledgeable in engineering, sciences, arts, law, medicine, and social sciences.
Format your responses clearly using markdown when helpful (bullet points, headers, code blocks for equations).`;

      if (mode === 'beginner') systemPrompt += '\nExplain everything in extremely simple terms, as if to someone encountering the topic for the first time.';
      if (mode === 'analogy') systemPrompt += '\nUse creative, memorable real-world analogies to explain complex concepts.';
      if (mode === 'exam') systemPrompt += '\nFocus strictly on exam-relevant facts, common exam questions, and key points students must know. Be concise and targeted.';

      // Inject PDF context if available
      if (pdfText) {
        systemPrompt += `\n\nThe student has uploaded a document. Here is the extracted text content:\n---\n${pdfText.substring(0, 6000)}\n---\nUse this as context when answering their questions.`;
      }

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage }
      ] as any;

      const response = await callGroqApi(apiMessages, 'llama-3.3-70b-versatile');
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please check your internet connection and try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center">
            <Brain size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Tutor</h1>
            <p className="text-xs text-gray-500">Instant, personalized explanations · PDF analysis</p>
          </div>
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            options={[
              { value: 'standard', label: '🧠 Standard Mode' },
              { value: 'beginner', label: '🐣 Explain Simply' },
              { value: 'analogy', label: '💡 Use Analogies' },
              { value: 'exam', label: '🎯 Exam Focus' },
            ]}
          />
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/50">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <Avatar
                  src={msg.role === 'user' ? user?.avatar_url : undefined}
                  initials={msg.role === 'user' ? (user?.first_name?.charAt(0)?.toUpperCase() || '?') : '✦'}
                  className={msg.role === 'assistant' ? 'bg-gradient-to-br from-primary to-accent text-white' : ''}
                />
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-primary to-accent text-white rounded-tr-none shadow-md shadow-primary/10'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none'
                }`}>
                  {msg.attachmentName && (
                    <div className="flex items-center gap-1.5 mb-2 text-xs opacity-70">
                      <FileText size={12} /> {msg.attachmentName}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <Avatar initials="✦" className="bg-gradient-to-br from-primary to-accent text-white" />
                <div className="p-4 rounded-2xl rounded-tl-none bg-gray-100 dark:bg-gray-800">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Attached File Preview Banner */}
        {attachedFile && (
          <div className="px-4 py-2 bg-primary/5 dark:bg-primary/10 border-t border-primary/20 flex items-center gap-2">
            <FileText size={14} className="text-primary flex-shrink-0" />
            <span className="text-xs text-primary font-medium truncate flex-1">{attachedFile.name}</span>
            {isExtracting && <span className="text-xs text-gray-400 animate-pulse">Reading...</span>}
            <button onClick={removeAttachment} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSend} className="flex gap-2 items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileAttach}
              accept=".pdf,.txt,.doc,.docx"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach PDF or document"
              className={`flex-shrink-0 p-2.5 rounded-xl transition-all ${
                attachedFile
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-400 hover:text-primary hover:bg-primary/10'
              }`}
            >
              <Paperclip size={18} />
            </button>
            <div className="flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={attachedFile ? `Ask about ${attachedFile.name}...` : 'Ask your tutor anything...'}
                className="w-full"
                disabled={isLoading || isExtracting}
              />
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading || isExtracting}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 flex-shrink-0"
            >
              <Send size={18} />
            </Button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-2">Powered by Llama 3.3 · Attach PDF, TXT, or DOC files for analysis</p>
        </div>
      </Card>
    </div>
  );
};
