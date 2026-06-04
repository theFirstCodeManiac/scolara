import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Image, Paperclip, Smile, Reply, MoreHorizontal, Pin,
  Trash2, Edit3, X, ChevronDown, MessageSquare
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useHub } from '../../context/HubContext';
import { useHubRealtime } from '../../hooks/useHubRealtime';

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉', '👏'];

interface Message {
  id: string;
  sender_id: string;
  body: string;
  message_type: string;
  media_url?: string;
  reply_to_id?: string;
  is_pinned: boolean;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  sender?: { full_name: string; avatar_url?: string };
  reply_to?: { body: string; sender?: { full_name: string } };
  reactions?: { emoji: string; user_id: string }[];
}

interface GroupChatProps {
  groupId: string;
  groupName: string;
}

export const GroupChat: React.FC<GroupChatProps> = ({ groupId, groupName: _groupName }) => {
  const { hubUser } = useHub();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [contextMenu, setContextMenu] = useState<{ messageId: string; x: number; y: number } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<Record<string, { full_name: string; avatar_url?: string }>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  // Realtime new messages
  const handleNewMessage = useCallback(async (msg: any) => {
    // Fetch sender profile
    const profile = await getProfile(msg.sender_id);
    const enriched = { ...msg, sender: profile };

    setMessages(prev => {
      if (prev.find(m => m.id === msg.id)) return prev;
      return [...prev, enriched];
    });
    setTimeout(scrollToBottom, 100);
  }, []);

  const handleMessageUpdate = useCallback((msg: any) => {
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, ...msg } : m));
  }, []);

  const handleMessageDelete = useCallback((msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, is_deleted: true, body: 'This message was deleted' } : m));
  }, []);

  useHubRealtime({ groupId, onNewMessage: handleNewMessage, onMessageUpdate: handleMessageUpdate, onMessageDelete: handleMessageDelete });

  const getProfile = async (userId: string) => {
    if (memberProfiles[userId]) return memberProfiles[userId];
    const { data } = await supabase.from('hub_aspirants').select('full_name, avatar_url').eq('user_id', userId).single();
    const profile = data || { full_name: 'User' };
    setMemberProfiles(prev => ({ ...prev, [userId]: profile }));
    return profile;
  };

  useEffect(() => {
    fetchMessages();
    fetchPinnedMessages();
  }, [groupId]);

  const fetchMessages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('hub_messages')
      .select('*, hub_message_reactions(emoji, user_id)')
      .eq('group_id', groupId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .limit(100);

    if (data) {
      const enriched = await Promise.all(data.map(async (msg) => ({
        ...msg,
        sender: await getProfile(msg.sender_id),
        reactions: msg.hub_message_reactions,
      })));
      setMessages(enriched);
    }
    setLoading(false);
    setTimeout(scrollToBottom, 200);
  };

  const fetchPinnedMessages = async () => {
    const { data } = await supabase
      .from('hub_messages')
      .select('*')
      .eq('group_id', groupId)
      .eq('is_pinned', true)
      .limit(3);
    setPinnedMessages(data || []);
  };

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollButton(!atBottom);
  };

  const sendMessage = async () => {
    if (!text.trim() || !hubUser || sending) return;
    setSending(true);
    const body = text.trim();
    setText('');

    const { error } = await supabase.from('hub_messages').insert({
      group_id: groupId,
      sender_id: hubUser.id,
      body,
      message_type: 'text',
      reply_to_id: replyTo?.id || null,
    });

    setReplyTo(null);
    setSending(false);
    if (error) console.error(error);
  };

  const saveEdit = async () => {
    if (!editingId || !editText.trim()) return;
    await supabase.from('hub_messages').update({
      body: editText.trim(),
      is_edited: true,
      edited_at: new Date().toISOString(),
    }).eq('id', editingId).eq('sender_id', hubUser?.id);
    setEditingId(null);
    setEditText('');
  };

  const deleteMessage = async (msgId: string) => {
    await supabase.from('hub_messages').update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    }).eq('id', msgId).eq('sender_id', hubUser?.id);
    setContextMenu(null);
  };

  const pinMessage = async (msgId: string, currentPinned: boolean) => {
    await supabase.from('hub_messages').update({ is_pinned: !currentPinned }).eq('id', msgId);
    fetchPinnedMessages();
    setContextMenu(null);
  };

  const reactToMessage = async (msgId: string, emoji: string) => {
    if (!hubUser) return;
    const existing = messages.find(m => m.id === msgId)?.reactions?.find(r => r.user_id === hubUser.id);
    if (existing) {
      await supabase.from('hub_message_reactions').delete().eq('message_id', msgId).eq('user_id', hubUser.id);
    } else {
      await supabase.from('hub_message_reactions').upsert({ message_id: msgId, user_id: hubUser.id, emoji });
    }
    setShowEmojiPicker(null);
    fetchMessages();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isOwnMessage = (msg: Message) => msg.sender_id === hubUser?.id;

  const groupedReactions = (reactions: { emoji: string; user_id: string }[] = []) => {
    return reactions.reduce((acc: Record<string, number>, r) => {
      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
      return acc;
    }, {});
  };

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  let lastDate = '';

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[400px] bg-hub-dark-bg" onClick={() => setContextMenu(null)}>
      {/* Pinned messages */}
      {pinnedMessages.length > 0 && (
        <div className="px-4 py-2 border-b border-hub-dark-border bg-hub-dark-surface/50">
          <div className="flex items-center gap-2 text-xs text-hub-gold">
            <Pin size={12} />
            <span className="font-semibold">{pinnedMessages.length} pinned message{pinnedMessages.length > 1 ? 's' : ''}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{pinnedMessages[0]?.body}</p>
        </div>
      )}

      {/* Messages area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
      >
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-hub-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare size={32} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No messages yet. Be the first to say hello! 👋</p>
          </div>
        ) : (
          messages.map((msg) => {
            const msgDate = formatDate(msg.created_at);
            const showDateDivider = msgDate !== lastDate;
            lastDate = msgDate;
            const own = isOwnMessage(msg);
            const reactionGroups = groupedReactions(msg.reactions);

            return (
              <React.Fragment key={msg.id}>
                {showDateDivider && (
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-hub-dark-border" />
                    <span className="text-[11px] text-gray-600 bg-hub-dark-bg px-2">{msgDate}</span>
                    <div className="flex-1 h-px bg-hub-dark-border" />
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`group flex gap-2.5 ${own ? 'flex-row-reverse' : 'flex-row'} items-end`}
                >
                  {/* Avatar */}
                  {!own && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-hub-gold to-hub-aqua flex items-center justify-center text-hub-navy font-bold text-xs flex-shrink-0 mb-4">
                      {msg.sender?.full_name?.charAt(0) || '?'}
                    </div>
                  )}

                  <div className={`max-w-[75%] ${own ? 'items-end' : 'items-start'} flex flex-col`}>
                    {/* Sender name */}
                    {!own && !msg.is_deleted && (
                      <span className="text-[11px] text-hub-aqua font-semibold mb-0.5 ml-1">
                        {msg.sender?.full_name || 'Member'}
                      </span>
                    )}

                    {/* Reply preview */}
                    {msg.reply_to_id && !msg.is_deleted && (
                      <div className={`max-w-full px-3 py-1.5 rounded-xl mb-1 border-l-2 border-hub-gold ${own ? 'bg-hub-gold/5' : 'bg-hub-dark-surface'}`}>
                        <p className="text-[11px] text-hub-gold font-semibold">Reply</p>
                        <p className="text-xs text-gray-500 truncate">...</p>
                      </div>
                    )}

                    {/* Bubble */}
                    <div className="relative">
                      {editingId === msg.id ? (
                        <div className="flex items-center gap-2">
                          <textarea
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            className="bg-hub-dark-surface border border-hub-gold/40 rounded-xl px-3 py-2 text-sm text-white resize-none w-48 focus:outline-none"
                            rows={2}
                            autoFocus
                          />
                          <button onClick={saveEdit} className="p-1.5 bg-hub-gold rounded-lg text-hub-navy"><Send size={13} /></button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 bg-hub-dark-border rounded-lg text-gray-400"><X size={13} /></button>
                        </div>
                      ) : (
                        <div
                          className={`relative px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed select-text ${
                            msg.is_deleted
                              ? 'bg-hub-dark-surface border border-hub-dark-border text-gray-600 italic'
                              : own
                              ? 'bg-hub-gold text-hub-navy'
                              : 'bg-hub-dark-surface text-gray-200 border border-hub-dark-border'
                          } ${own ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                          onContextMenu={e => {
                            if (!msg.is_deleted) {
                              e.preventDefault();
                              setContextMenu({ messageId: msg.id, x: e.clientX, y: e.clientY });
                            }
                          }}
                        >
                          {msg.body}
                          {msg.is_edited && !msg.is_deleted && (
                            <span className={`text-[10px] ml-1.5 ${own ? 'text-hub-navy/60' : 'text-gray-600'}`}>edited</span>
                          )}
                        </div>
                      )}

                      {/* Hover actions */}
                      {!msg.is_deleted && (
                        <div className={`absolute top-1 ${own ? 'right-full mr-2' : 'left-full ml-2'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1`}>
                          <button
                            onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}
                            className="p-1.5 bg-hub-dark-surface border border-hub-dark-border rounded-lg text-gray-500 hover:text-hub-gold transition-colors"
                          >
                            <Smile size={13} />
                          </button>
                          <button
                            onClick={() => setReplyTo(msg)}
                            className="p-1.5 bg-hub-dark-surface border border-hub-dark-border rounded-lg text-gray-500 hover:text-hub-aqua transition-colors"
                          >
                            <Reply size={13} />
                          </button>
                          {own && (
                            <button
                              onClick={() => { setEditingId(msg.id); setEditText(msg.body); }}
                              className="p-1.5 bg-hub-dark-surface border border-hub-dark-border rounded-lg text-gray-500 hover:text-white transition-colors"
                            >
                              <Edit3 size={13} />
                            </button>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); setContextMenu({ messageId: msg.id, x: e.clientX, y: e.clientY }); }}
                            className="p-1.5 bg-hub-dark-surface border border-hub-dark-border rounded-lg text-gray-500 hover:text-white transition-colors"
                          >
                            <MoreHorizontal size={13} />
                          </button>
                        </div>
                      )}

                      {/* Emoji picker */}
                      {showEmojiPicker === msg.id && (
                        <div className={`absolute bottom-full mb-1 ${own ? 'right-0' : 'left-0'} flex gap-1 bg-hub-dark-surface border border-hub-dark-border rounded-full px-2 py-1.5 shadow-xl z-10`}>
                          {EMOJI_REACTIONS.map(e => (
                            <button key={e} onClick={() => reactToMessage(msg.id, e)} className="text-lg hover:scale-125 transition-transform">
                              {e}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Reactions */}
                    {Object.keys(reactionGroups).length > 0 && (
                      <div className={`flex gap-1 mt-1 ${own ? 'justify-end' : 'justify-start'}`}>
                        {Object.entries(reactionGroups).map(([emoji, count]) => (
                          <button
                            key={emoji}
                            onClick={() => reactToMessage(msg.id, emoji)}
                            className="flex items-center gap-0.5 px-1.5 py-0.5 bg-hub-dark-surface border border-hub-dark-border rounded-full text-xs hover:border-hub-gold/30 transition-colors"
                          >
                            <span>{emoji}</span>
                            <span className="text-gray-400">{count}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Time */}
                    <span className={`text-[10px] text-gray-600 mt-0.5 ${own ? 'text-right' : 'text-left'}`}>
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                </motion.div>
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 right-8 w-9 h-9 bg-hub-gold text-hub-navy rounded-full flex items-center justify-center shadow-lg"
          >
            <ChevronDown size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-hub-dark-surface border border-hub-dark-border rounded-xl shadow-2xl py-1.5 min-w-[140px]"
          style={{ top: contextMenu.y, left: Math.min(contextMenu.x, window.innerWidth - 160) }}
          onClick={e => e.stopPropagation()}
        >
          {[
            { label: 'Reply', icon: <Reply size={13} />, action: () => { const m = messages.find(m => m.id === contextMenu.messageId); if(m) setReplyTo(m); setContextMenu(null); } },
            { label: 'Pin message', icon: <Pin size={13} />, action: () => { const m = messages.find(m => m.id === contextMenu.messageId); if(m) pinMessage(m.id, m.is_pinned); } },
            ...(messages.find(m => m.id === contextMenu.messageId)?.sender_id === hubUser?.id ? [
              { label: 'Edit', icon: <Edit3 size={13} />, action: () => { const m = messages.find(m => m.id === contextMenu.messageId); if(m){ setEditingId(m.id); setEditText(m.body); } setContextMenu(null); } },
              { label: 'Delete', icon: <Trash2 size={13} />, action: () => deleteMessage(contextMenu.messageId), danger: true },
            ] : []),
          ].map((item: any) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                item.danger ? 'text-red-400 hover:bg-red-900/20' : 'text-gray-300 hover:bg-hub-dark-border'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Reply preview */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-hub-dark-border px-4 py-2 bg-hub-dark-surface flex items-center gap-3"
          >
            <div className="flex-1 border-l-2 border-hub-gold pl-3">
              <p className="text-[11px] text-hub-gold font-semibold">Replying to {replyTo.sender?.full_name || 'member'}</p>
              <p className="text-xs text-gray-400 truncate">{replyTo.body}</p>
            </div>
            <button onClick={() => setReplyTo(null)} className="text-gray-500 hover:text-white">
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="border-t border-hub-dark-border p-3 bg-hub-dark-bg">
        <div className="flex items-end gap-2">
          <button className="p-2.5 text-gray-500 hover:text-hub-gold transition-colors flex-shrink-0">
            <Image size={18} />
          </button>
          <button className="p-2.5 text-gray-500 hover:text-hub-gold transition-colors flex-shrink-0">
            <Paperclip size={18} />
          </button>
          <div className="flex-1 bg-hub-dark-surface border border-hub-dark-border rounded-2xl px-4 py-2.5">
            <textarea
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Enter to send)"
              rows={1}
              className="w-full bg-transparent text-sm text-white placeholder-gray-600 resize-none focus:outline-none max-h-28"
              style={{ minHeight: '20px' }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!text.trim() || sending}
            className="p-2.5 bg-hub-gold rounded-xl text-hub-navy disabled:opacity-40 disabled:cursor-not-allowed hover:bg-hub-gold-dark transition-all flex-shrink-0 shadow-lg shadow-hub-gold/20"
          >
            <Send size={17} />
          </button>
        </div>
      </div>
    </div>
  );
};

