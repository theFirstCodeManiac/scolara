import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Send, MessageSquare, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useHub } from '../../context/HubContext';

interface Contact {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
}

interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  created_at: string;
}

export const DirectMessages: React.FC = () => {
  const { hubUser } = useHub();
  const navigate = useNavigate();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [search, setSearch] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hubUser) {
      navigate('/hub/login');
      return;
    }
    fetchContacts();
  }, [hubUser]);

  useEffect(() => {
    if (activeContact) {
      fetchDirectMessages(activeContact.id);

      // Set up real-time subscription for private DMs
      const channel = supabase
        .channel(`private-dm-${hubUser?.id}-${activeContact.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'hub_direct_messages' },
          (payload) => {
            const newMsg = payload.new as DirectMessage;
            if (
              (newMsg.sender_id === hubUser?.id && newMsg.receiver_id === activeContact.id) ||
              (newMsg.sender_id === activeContact.id && newMsg.receiver_id === hubUser?.id)
            ) {
              setMessages(prev => [...prev, newMsg]);
              setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeContact]);

  const fetchContacts = async () => {
    setLoading(true);
    // Find all users (in a production scenario, query based on common group memberships)
    const { data: aspirants } = await supabase.from('hub_aspirants').select('user_id, full_name, avatar_url').limit(20);
    const { data: tutors } = await supabase.from('hub_tutors').select('user_id, bio').limit(10);

    const formattedContacts: Contact[] = [
      ...(aspirants || []).map(a => ({ id: a.user_id, full_name: a.full_name, avatar_url: a.avatar_url, role: 'aspirant' })),
      ...(tutors || []).map(t => ({ id: t.user_id, full_name: 'Verified Tutor', role: 'tutor' })),
    ].filter(c => c.id !== hubUser?.id);

    setContacts(formattedContacts);
    if (formattedContacts.length > 0) {
      setActiveContact(formattedContacts[0]);
    }
    setLoading(false);
  };

  const fetchDirectMessages = async (contactId: string) => {
    if (!hubUser) return;
    const { data } = await supabase
      .from('hub_direct_messages')
      .select('*')
      .or(`and(sender_id.eq.${hubUser.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${hubUser.id})`)
      .order('created_at', { ascending: true });

    setMessages(data || []);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSend = async () => {
    if (!text.trim() || !activeContact || !hubUser || sending) return;
    setSending(true);

    const body = text.trim();
    setText('');

    await supabase.from('hub_direct_messages').insert({
      sender_id: hubUser.id,
      receiver_id: activeContact.id,
      body,
    });

    setSending(false);
  };

  const filteredContacts = contacts.filter(c => c.full_name.toLowerCase().includes(search.toLowerCase()));

  // _inputClass removed - unused

  return (
    <div className="bg-hub-dark-bg min-h-screen flex">
      {/* Sidebar - Contacts */}
      <div className="w-80 border-r border-hub-dark-border flex flex-col bg-hub-dark-surface/30">
        <div className="p-4 border-b border-hub-dark-border">
          <h2 className="text-xl font-bold text-white mb-3">Chats</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search contacts..."
              className="w-full bg-hub-dark-surface border border-hub-dark-border rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-hub-dark-border/20">
          {loading ? (
            <div className="p-4 text-center"><Loader2 className="animate-spin text-hub-gold mx-auto" /></div>
          ) : (
            filteredContacts.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveContact(c)}
                className={`w-full p-4 flex items-center gap-3 text-left transition-colors ${
                  activeContact?.id === c.id ? 'bg-hub-navy' : 'hover:bg-hub-dark-surface'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-hub-gold to-hub-aqua flex items-center justify-center text-hub-navy font-bold text-sm">
                  {c.full_name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{c.full_name}</h4>
                  <span className="text-[10px] text-gray-500 uppercase">{c.role}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-hub-dark-bg">
        {activeContact ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-hub-dark-border flex items-center gap-3 bg-hub-dark-surface/40">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-hub-gold to-hub-aqua flex items-center justify-center text-hub-navy font-bold text-sm">
                {activeContact.full_name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">{activeContact.full_name}</h3>
                <span className="text-[10px] text-hub-aqua uppercase">{activeContact.role}</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(m => {
                const own = m.sender_id === hubUser?.id;
                return (
                  <div key={m.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-2xl text-xs max-w-[70%] leading-relaxed ${
                      own ? 'bg-hub-gold text-hub-navy rounded-tr-sm' : 'bg-hub-dark-surface text-white border border-hub-dark-border rounded-tl-sm'
                    }`}>
                      {m.body}
                      <span className="block text-[8px] text-gray-500 mt-1 text-right">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-hub-dark-border bg-hub-dark-surface/20">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 bg-hub-dark-surface border border-hub-dark-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  className="p-3 bg-hub-gold text-hub-navy rounded-xl hover:bg-hub-gold-dark transition-all"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageSquare size={48} className="text-gray-700 mb-4" />
            <h3 className="text-white font-bold mb-2">Start a Chat</h3>
            <p className="text-xs text-gray-500">Select a peer or verified tutor from the sidebar to start direct messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
};
