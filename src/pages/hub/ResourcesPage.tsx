import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Download, Search, BookOpen, FileText, Video, Image,
  Music, Link as LinkIcon, Bookmark, BookmarkCheck, Upload,
  X, Plus, Calendar, Tag
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useHub } from '../../context/HubContext';

interface Resource {
  id: string;
  title: string;
  description?: string;
  resource_type: 'pdf' | 'video' | 'image' | 'note' | 'audio' | 'link';
  file_url?: string;
  subject?: string;
  year?: number;
  topic?: string;
  download_count: number;
  is_free_preview: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText size={18} className="text-red-400" />,
  video: <Video size={18} className="text-blue-400" />,
  image: <Image size={18} className="text-green-400" />,
  note: <BookOpen size={18} className="text-hub-gold" />,
  audio: <Music size={18} className="text-purple-400" />,
  link: <LinkIcon size={18} className="text-hub-aqua" />,
};

const TYPE_COLORS: Record<string, string> = {
  pdf: 'bg-red-900/20 border-red-700/30',
  video: 'bg-blue-900/20 border-blue-700/30',
  image: 'bg-green-900/20 border-green-700/30',
  note: 'bg-hub-gold/10 border-hub-gold/20',
  audio: 'bg-purple-900/20 border-purple-700/30',
  link: 'bg-hub-aqua/10 border-hub-aqua/20',
};

interface ResourcesPageProps {
  groupId: string;
  isTutor?: boolean;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ groupId, isTutor }) => {
  const { hubUser } = useHub();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [showUpload, setShowUpload] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);

  // Upload form
  const [form, setForm] = useState({ title: '', description: '', resource_type: 'pdf', subject: '', year: '', topic: '', file_url: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchResources();
    if (hubUser) fetchBookmarks();
  }, [groupId, typeFilter, subjectFilter]);

  const fetchResources = async () => {
    setLoading(true);
    let query = supabase.from('hub_resources').select('*').eq('group_id', groupId).order('created_at', { ascending: false });
    if (typeFilter !== 'all') query = query.eq('resource_type', typeFilter);
    if (subjectFilter !== 'all') query = query.eq('subject', subjectFilter);
    const { data } = await query;
    setResources(data || []);
    const uniqueSubjects = [...new Set((data || []).map((r: Resource) => r.subject).filter(Boolean))] as string[];
    setSubjects(uniqueSubjects);
    setLoading(false);
  };

  const fetchBookmarks = async () => {
    if (!hubUser) return;
    const { data } = await supabase.from('hub_resource_bookmarks').select('resource_id').eq('user_id', hubUser.id);
    setBookmarks(new Set(data?.map(b => b.resource_id) || []));
  };

  const toggleBookmark = async (resourceId: string) => {
    if (!hubUser) return;
    const isBookmarked = bookmarks.has(resourceId);
    if (isBookmarked) {
      await supabase.from('hub_resource_bookmarks').delete().eq('user_id', hubUser.id).eq('resource_id', resourceId);
      setBookmarks(prev => { const s = new Set(prev); s.delete(resourceId); return s; });
    } else {
      await supabase.from('hub_resource_bookmarks').insert({ user_id: hubUser.id, resource_id: resourceId });
      setBookmarks(prev => new Set([...prev, resourceId]));
    }
  };

  const handleDownload = async (resource: Resource) => {
    if (resource.file_url) {
      window.open(resource.file_url, '_blank');
      await supabase.from('hub_resources').update({ download_count: resource.download_count + 1 }).eq('id', resource.id);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hubUser || !form.title) return;
    setUploading(true);
    const { data: tutorData } = await supabase.from('hub_tutors').select('id').eq('user_id', hubUser.id).single();
    if (tutorData) {
      await supabase.from('hub_resources').insert({
        group_id: groupId,
        tutor_id: tutorData.id,
        title: form.title,
        description: form.description,
        resource_type: form.resource_type,
        subject: form.subject,
        year: form.year ? parseInt(form.year) : null,
        topic: form.topic,
        file_url: form.file_url,
      });
      setShowUpload(false);
      setForm({ title: '', description: '', resource_type: 'pdf', subject: '', year: '', topic: '', file_url: '' });
      fetchResources();
    }
    setUploading(false);
  };

  const filtered = resources.filter(r => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return r.title.toLowerCase().includes(q) || r.subject?.toLowerCase().includes(q) || r.topic?.toLowerCase().includes(q);
  });

  const inputClass = "w-full bg-hub-dark-bg border border-hub-dark-border rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-hub-gold/40";

  return (
    <div className="p-4 md:p-6 bg-hub-dark-bg min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-white">Learning Resources</h2>
          <p className="text-sm text-gray-500">{resources.length} files available</p>
        </div>
        {isTutor && (
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 px-4 py-2 bg-hub-gold text-hub-navy font-bold text-sm rounded-xl hover:bg-hub-gold-dark transition-all"
          >
            <Plus size={15} /> Add Resource
          </button>
        )}
      </div>

      {/* Upload Form */}
      {showUpload && isTutor && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleUpload}
          className="mb-6 p-5 bg-hub-dark-surface border border-hub-dark-border rounded-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2"><Upload size={16} className="text-hub-gold" /> Upload Resource</h3>
            <button type="button" onClick={() => setShowUpload(false)}><X size={16} className="text-gray-500" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="col-span-2">
              <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Resource title *" required className={inputClass} />
            </div>
            <div className="col-span-2">
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description (optional)" rows={2} className={`${inputClass} resize-none`} />
            </div>
            <select value={form.resource_type} onChange={e => setForm({...form, resource_type: e.target.value})} className={`${inputClass} appearance-none`}>
              {['pdf', 'video', 'image', 'note', 'audio', 'link'].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </select>
            <input type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="Subject (e.g. Mathematics)" className={inputClass} />
            <input type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})} placeholder="Year (e.g. 2023)" className={inputClass} />
            <input type="text" value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} placeholder="Topic" className={inputClass} />
            <div className="col-span-2">
              <input type="url" value={form.file_url} onChange={e => setForm({...form, file_url: e.target.value})} placeholder="File URL or link" className={inputClass} />
            </div>
          </div>
          <button type="submit" disabled={uploading} className="mt-4 px-6 py-2.5 bg-hub-gold text-hub-navy font-bold text-sm rounded-xl hover:bg-hub-gold-dark transition-all disabled:opacity-60">
            {uploading ? 'Uploading...' : 'Upload Resource'}
          </button>
        </motion.form>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources..." className="w-full bg-hub-dark-surface border border-hub-dark-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-hub-gold/40" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'pdf', 'video', 'note', 'image', 'audio', 'link'].map(type => (
            <button key={type} onClick={() => setTypeFilter(type)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition-all capitalize ${
                typeFilter === type ? 'bg-hub-gold text-hub-navy border-hub-gold' : 'bg-hub-dark-surface text-gray-400 border-hub-dark-border hover:border-hub-gold/30'
              }`}
            >
              {type !== 'all' && TYPE_ICONS[type]} {type === 'all' ? '📁 All' : type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Subject filter */}
      {subjects.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-5">
          <button onClick={() => setSubjectFilter('all')}
            className={`px-3 py-1 text-xs rounded-full border transition-all ${subjectFilter === 'all' ? 'bg-hub-aqua text-white border-hub-aqua' : 'text-gray-500 border-hub-dark-border hover:border-hub-aqua/30'}`}>
            All Subjects
          </button>
          {subjects.map(s => (
            <button key={s} onClick={() => setSubjectFilter(s)}
              className={`px-3 py-1 text-xs rounded-full border transition-all ${subjectFilter === s ? 'bg-hub-aqua text-white border-hub-aqua' : 'text-gray-500 border-hub-dark-border hover:border-hub-aqua/30'}`}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Resources grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-36 bg-hub-dark-surface border border-hub-dark-border rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={32} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 font-medium mb-1">No resources found</p>
          <p className="text-sm text-gray-600">{isTutor ? 'Click "Add Resource" to upload the first file.' : 'Check back later when the tutor uploads materials.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((resource, i) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`p-4 border rounded-2xl flex flex-col gap-3 hover:shadow-lg transition-all ${TYPE_COLORS[resource.resource_type] || 'bg-hub-dark-surface border-hub-dark-border'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-hub-dark-bg flex items-center justify-center flex-shrink-0">
                    {TYPE_ICONS[resource.resource_type]}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white line-clamp-1">{resource.title}</h3>
                    <span className="text-[10px] font-medium uppercase text-gray-500">{resource.resource_type}</span>
                  </div>
                </div>
                <button onClick={() => toggleBookmark(resource.id)} className="text-gray-500 hover:text-hub-gold transition-colors flex-shrink-0">
                  {bookmarks.has(resource.id) ? <BookmarkCheck size={16} className="text-hub-gold" /> : <Bookmark size={16} />}
                </button>
              </div>

              {resource.description && <p className="text-xs text-gray-400 line-clamp-2">{resource.description}</p>}

              <div className="flex flex-wrap gap-1.5">
                {resource.subject && (
                  <span className="flex items-center gap-1 text-[10px] bg-hub-dark-bg border border-hub-dark-border text-gray-400 px-2 py-0.5 rounded-full">
                    <Tag size={9} /> {resource.subject}
                  </span>
                )}
                {resource.year && (
                  <span className="flex items-center gap-1 text-[10px] bg-hub-dark-bg border border-hub-dark-border text-gray-400 px-2 py-0.5 rounded-full">
                    <Calendar size={9} /> {resource.year}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-auto">
                <span className="text-[11px] text-gray-600 flex items-center gap-1">
                  <Download size={11} /> {resource.download_count} downloads
                </span>
                {resource.file_url ? (
                  <button
                    onClick={() => handleDownload(resource)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-hub-gold text-hub-navy text-xs font-bold rounded-lg hover:bg-hub-gold-dark transition-all"
                  >
                    <Download size={12} /> Download
                  </button>
                ) : (
                  <span className="text-xs text-gray-600 italic">No file yet</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
