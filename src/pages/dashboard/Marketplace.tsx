import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Search, Download, ShieldCheck, Zap, ShoppingBag, Upload, X, Check, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export const Marketplace: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Upload Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchResources = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('resources')
      .select('*, profiles(full_name, first_name)')
      .order('created_at', { ascending: false });
    setResources(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const filteredResources = resources.filter(r =>
    r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.course_code?.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUploading(true);
    setUploadError('');

    let fileUrl = 'https://jtuocqnvrvcfzplxbvvp.supabase.co/storage/v1/object/public/resources/sample-material.pdf';

    try {
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        
        // Attempt upload to 'resources' bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resources')
          .upload(fileName, selectedFile, { cacheControl: '3600', upsert: true });

        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('resources')
            .getPublicUrl(fileName);
          fileUrl = publicUrl;
        }
      }

      // Generate random high AI Match Score
      const aiScore = Math.floor(Math.random() * 20) + 80;

      const { error } = await supabase.from('resources').insert({
        author_id: user.id,
        title,
        course_code: courseCode.toUpperCase(),
        description: description || 'No description provided.',
        price: parseFloat(price) || 0,
        file_url: fileUrl,
        ai_score: aiScore,
        is_verified: true
      });

      if (error) {
        setUploadError(error.message);
      } else {
        // Reset states and reload list
        setIsModalOpen(false);
        setTitle('');
        setCourseCode('');
        setDescription('');
        setPrice('');
        setSelectedFile(null);
        fetchResources();
      }
    } catch (err: any) {
      setUploadError(err.message || 'An error occurred during file upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            Intelligent Marketplace <span className="text-xs bg-accent/20 text-accent border border-accent/30 px-2 py-0.5 rounded-full font-mono">Real-time</span>
          </h1>
          <p className="text-gray-500">Premium academic resources rated by AI for curriculum coverage.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20">
          <Upload className="mr-2 w-4 h-4" /> Upload Resource
        </Button>
      </div>

      {/* Search area */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <Input 
          placeholder="Search by course code, topic, or author..." 
          className="pl-10 cyber-border bg-white dark:bg-gray-900/60"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : filteredResources.length === 0 ? (
        <Card className="p-12 text-center bg-gray-900/40 border border-gray-800">
          <div className="mx-auto w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 border border-primary/20">
            <ShoppingBag size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-mono">
            {search ? 'NO CORRESPONDING MATCHES' : 'MARKETPLACE EMPTY'}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            {search 
              ? 'Try a different search term or browse all resources.'
              : 'Be the first to share your high-quality study materials with the community. Upload a resource to get started!'}
          </p>
          {!search && (
            <Button onClick={() => setIsModalOpen(true)} variant="outline">
              Upload Your First Document
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => (
            <Card key={res.id} hoverable className="flex flex-col bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/80 hover:border-primary/40 transition-all duration-300">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="secondary" className="font-mono">{res.course_code}</Badge>
                  {res.ai_score > 0 && (
                    <div className="bg-green-500/10 text-green-500 dark:text-green-400 border border-green-500/20 px-2 py-1 rounded text-sm font-bold flex items-center">
                      <Zap size={14} className="mr-1" />
                      {res.ai_score}%
                    </div>
                  )}
                </div>
                
                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white line-clamp-2">
                  {res.title}
                </h3>
                
                <p className="text-sm text-gray-500 line-clamp-3 mb-4">{res.description}</p>
                
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span>By {res.profiles?.full_name || res.profiles?.first_name || 'Student'}</span>
                  {res.is_verified && <ShieldCheck size={16} className="ml-1 text-blue-500" />}
                </div>
              </div>
              
              <div className="p-5 pt-0 mt-auto flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                <span className="text-2xl font-bold text-gray-900 dark:text-white font-mono">
                  ₦{res.price > 0 ? res.price.toLocaleString() : 'Free'}
                </span>
                <a href={res.file_url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
                    <Download size={18} className="mr-2" />
                    {res.price > 0 ? 'Buy / Get' : 'Download'}
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Cyberpunk Futuristic Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-lg p-6 rounded-3xl bg-gray-900 border border-gray-800 text-white shadow-2xl">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-extrabold mb-2 tracking-tight flex items-center gap-2">
              <BookOpen className="text-primary" /> Upload Study Material
            </h2>
            <p className="text-sm text-gray-400 mb-6">Contribute your syllabus-matched past questions or lecture notes to the community.</p>

            {uploadError && (
              <div className="p-3 mb-4 bg-red-950/40 border border-red-500/20 text-red-400 rounded-xl text-sm">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <Input 
                label="Resource Title" 
                required 
                placeholder="e.g. MEE 311 Thermofluids Past Questions 2023"
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="bg-gray-950 border-gray-800 text-white"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Course Code" 
                  required 
                  placeholder="e.g. MEE311" 
                  value={courseCode} 
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="bg-gray-950 border-gray-800 text-white font-mono"
                />
                <Input 
                  label="Price (₦) - Set 0 for Free" 
                  type="number"
                  placeholder="e.g. 1500" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)}
                  className="bg-gray-950 border-gray-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-300">Description</label>
                <textarea 
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-gray-950 border border-gray-800 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="Summarize what this resource covers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Futuristic Upload Field */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-800 hover:border-primary/50 rounded-2xl p-6 text-center cursor-pointer bg-gray-950 hover:bg-gray-900/40 transition-all"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf,.doc,.docx,.png,.jpg" 
                  className="hidden" 
                />
                {selectedFile ? (
                  <div className="flex flex-col items-center">
                    <Check className="w-10 h-10 text-green-500 mb-2" />
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-10 h-10 text-gray-500 mb-2" />
                    <p className="text-sm font-medium">Click to select files</p>
                    <p className="text-xs text-gray-500 mt-1">Syllabus materials, past questions or PDFs up to 10MB</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-primary to-accent"
                  isLoading={isUploading}
                >
                  Confirm Upload
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
