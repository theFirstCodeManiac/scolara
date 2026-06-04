import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pin, MessageSquare, Send, Trash2, Plus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useHub } from '../../context/HubContext';

interface Announcement {
  id: string;
  title: string;
  body: string;
  image_url?: string;
  is_pinned: boolean;
  published_at: string;
  tutor_id: string;
}

interface AnnouncementsPageProps {
  groupId: string;
  isTutor?: boolean;
  hasAccess: boolean;
}

export const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({ groupId, isTutor, hasAccess }) => {
  const { hubUser } = useHub();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Active comments & reactions states
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    fetchAnnouncements();
  }, [groupId]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('hub_announcements')
      .select('*')
      .eq('group_id', groupId)
      .eq('is_published', true)
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false });

    setAnnouncements(data || []);
    setLoading(false);

    if (data) {
      data.forEach((ann: Announcement) => {
        fetchComments(ann.id);
        fetchReactions(ann.id);
      });
    }
  };

  const fetchComments = async (annId: string) => {
    const { data } = await supabase
      .from('hub_announcement_comments')
      .select('*, hub_aspirants(full_name, avatar_url)')
      .eq('announcement_id', annId)
      .order('created_at', { ascending: true });
    setComments(prev => ({ ...prev, [annId]: data || [] }));
  };

  const fetchReactions = async (annId: string) => {
    const { data } = await supabase
      .from('hub_announcement_reactions')
      .select('emoji');

    const counts: Record<string, number> = {};
    (data || []).forEach(r => {
      counts[r.emoji] = (counts[r.emoji] || 0) + 1;
    });
    setReactions(prev => ({ ...prev, [annId]: counts }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !hubUser) return;
    setSubmitting(true);

    const { data: tutorData } = await supabase
      .from('hub_tutors')
      .select('id')
      .eq('user_id', hubUser.id)
      .single();

    if (tutorData) {
      await supabase.from('hub_announcements').insert({
        group_id: groupId,
        tutor_id: tutorData.id,
        title: title.trim(),
        body: body.trim(),
        image_url: imageUrl.trim() || null,
        is_pinned: isPinned,
        is_published: true,
      });

      setTitle('');
      setBody('');
      setImageUrl('');
      setIsPinned(false);
      setShowCreate(false);
      fetchAnnouncements();
    }
    setSubmitting(false);
  };

  const deleteAnnouncement = async (annId: string) => {
    if (!window.confirm('Delete this announcement?')) return;
    await supabase.from('hub_announcements').delete().eq('id', annId);
    fetchAnnouncements();
  };

  const addComment = async (annId: string) => {
    const text = newCommentText[annId];
    if (!text?.trim() || !hubUser) return;

    await supabase.from('hub_announcement_comments').insert({
      announcement_id: annId,
      user_id: hubUser.id,
      body: text.trim(),
    });

    setNewCommentText(prev => ({ ...prev, [annId]: '' }));
    fetchComments(annId);
  };

  const reactToAnn = async (annId: string, emoji: string) => {
    if (!hubUser) return;
    await supabase.from('hub_announcement_reactions').upsert({
      announcement_id: annId,
      user_id: hubUser.id,
      emoji,
    });
    fetchReactions(annId);
  };

  const inputClass = "w-full bg-hub-dark-bg border border-hub-dark-border rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-hub-gold/40";

  return (
    <div className="p-4 md:p-6 bg-hub-dark-bg min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Announcements</h2>
          <p className="text-sm text-gray-500">Official updates from your tutor</p>
        </div>
        {isTutor && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2 bg-hub-gold text-hub-navy font-bold text-sm rounded-xl hover:bg-hub-gold-dark transition-all"
          >
            <Plus size={15} /> Create Update
          </button>
        )}
      </div>

      {/* Create Modal Form */}
      {showCreate && isTutor && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCreate}
          className="mb-6 p-5 bg-hub-dark-surface border border-hub-dark-border rounded-2xl space-y-3"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-white flex items-center gap-2">📢 Post New Announcement</h3>
            <button type="button" onClick={() => setShowCreate(false)}><X size={16} className="text-gray-500" /></button>
          </div>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title *" required className={inputClass} />
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your announcement content here..." rows={4} required className={`${inputClass} resize-none`} />
          <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Image URL (optional)" className={inputClass} />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="pin" checked={isPinned} onChange={e => setIsPinned(e.target.checked)} className="rounded border-gray-600 bg-hub-dark-bg text-hub-gold" />
            <label htmlFor="pin" className="text-xs text-gray-400">Pin this announcement to top</label>
          </div>
          <button type="submit" disabled={submitting} className="px-5 py-2 bg-hub-gold text-hub-navy font-bold text-xs rounded-xl hover:bg-hub-gold-dark">
            {submitting ? 'Publishing...' : 'Publish Update'}
          </button>
        </motion.form>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => <div key={i} className="h-44 bg-hub-dark-surface border border-hub-dark-border rounded-2xl animate-pulse" />)}
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 bg-hub-dark-surface/10 border border-dashed border-hub-dark-border rounded-2xl">
          <span className="text-4xl">📢</span>
          <p className="text-white font-semibold mt-3 mb-1">No announcements yet</p>
          <p className="text-sm text-gray-500">Tutor updates and announcements will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {announcements.map(ann => (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 bg-hub-dark-surface border rounded-2xl relative ${ann.is_pinned ? 'border-hub-gold/30' : 'border-hub-dark-border'}`}
            >
              {ann.is_pinned && (
                <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-bold text-hub-gold bg-hub-gold/10 px-2 py-0.5 rounded-full border border-hub-gold/20">
                  <Pin size={10} /> PINNED
                </div>
              )}

              <h3 className="text-lg font-bold text-white mb-1.5">{ann.title}</h3>
              <p className="text-xs text-gray-500 mb-4">{new Date(ann.published_at).toLocaleDateString()} at {new Date(ann.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>

              <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap mb-4">
                {ann.body}
              </div>

              {ann.image_url && (
                <img src={ann.image_url} alt="announcement" className="rounded-xl max-h-72 object-cover mb-4 border border-hub-dark-border" />
              )}

              {/* Reactions & Admin Delete */}
              <div className="flex items-center gap-3 border-t border-hub-dark-border pt-4 mb-4 flex-wrap">
                {['👍', '❤️', '🔥', '🎉'].map(emoji => {
                  const count = reactions[ann.id]?.[emoji] || 0;
                  return (
                    <button
                      key={emoji}
                      disabled={!hasAccess}
                      onClick={() => reactToAnn(ann.id, emoji)}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border transition-all ${
                        count > 0 ? 'bg-hub-navy border-hub-gold/30 text-hub-gold' : 'bg-hub-dark-bg border-hub-dark-border text-gray-500 hover:border-hub-gold/30'
                      }`}
                    >
                      <span>{emoji}</span>
                      {count > 0 && <span className="font-semibold">{count}</span>}
                    </button>
                  );
                })}

                {isTutor && (
                  <button onClick={() => deleteAnnouncement(ann.id)} className="ml-auto text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1">
                    <Trash2 size={13} /> Delete
                  </button>
                )}
              </div>

              {/* Comments Section */}
              {hasAccess && (
                <div className="bg-hub-dark-bg/60 p-4 rounded-xl border border-hub-dark-border">
                  <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1.5"><MessageSquare size={12} /> Discussion ({comments[ann.id]?.length || 0})</h4>
                  <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
                    {comments[ann.id]?.map(c => (
                      <div key={c.id} className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-hub-navy flex items-center justify-center text-hub-gold font-bold text-[10px] flex-shrink-0">
                          {c.hub_aspirants?.full_name?.charAt(0) || '?'}
                        </div>
                        <div className="bg-hub-dark-surface p-2.5 rounded-xl flex-1 border border-hub-dark-border/40">
                          <p className="text-[10px] font-bold text-white mb-0.5">{c.hub_aspirants?.full_name || 'Member'}</p>
                          <p className="text-xs text-gray-300">{c.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Post comment */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCommentText[ann.id] || ''}
                      onChange={e => setNewCommentText(prev => ({ ...prev, [ann.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addComment(ann.id)}
                      placeholder="Ask a question or comment..."
                      className="flex-1 bg-hub-dark-surface border border-hub-dark-border rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none"
                    />
                    <button onClick={() => addComment(ann.id)} className="p-2 bg-hub-gold text-hub-navy rounded-xl hover:bg-hub-gold-dark transition-all">
                      <Send size={12} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
