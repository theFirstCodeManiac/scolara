import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Sparkles, MessageSquare, ShieldCheck, Zap, Trash2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useHub } from '../../context/HubContext';

interface HubNotification {
  id: string;
  title: string;
  message: string;
  notification_type: 'exam_results' | 'announcement' | 'chat_message' | 'payment_success';
  is_read: boolean;
  created_at: string;
}

const ICONS: Record<string, React.ReactNode> = {
  exam_results: <Zap className="text-hub-gold" size={18} />,
  announcement: <Sparkles className="text-hub-aqua" size={18} />,
  chat_message: <MessageSquare className="text-blue-400" size={18} />,
  payment_success: <ShieldCheck className="text-green-400" size={18} />,
};

const BGS: Record<string, string> = {
  exam_results: 'bg-hub-gold/5 border-hub-gold/20',
  announcement: 'bg-hub-aqua/5 border-hub-aqua/20',
  chat_message: 'bg-blue-950/20 border-blue-900/25',
  payment_success: 'bg-green-950/20 border-green-900/25',
};

export const NotificationsPage: React.FC = () => {
  const { hubUser } = useHub();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<HubNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hubUser) {
      navigate('/hub/login');
      return;
    }
    fetchNotifications();
  }, [hubUser]);

  const fetchNotifications = async () => {
    setLoading(true);
    if (!hubUser) return;

    const { data } = await supabase
      .from('hub_notifications')
      .select('*')
      .eq('user_id', hubUser.id)
      .order('created_at', { ascending: false })
      .limit(50);

    setNotifications(data || []);
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase.from('hub_notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const deleteNotification = async (id: string) => {
    await supabase.from('hub_notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllRead = async () => {
    if (!hubUser) return;
    await supabase.from('hub_notifications').update({ is_read: true }).eq('user_id', hubUser.id);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <div className="bg-hub-dark-bg min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-hub-dark-surface border border-hub-dark-border rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-hub-dark-border flex items-center justify-between bg-hub-dark-surface/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-hub-navy flex items-center justify-center text-hub-gold border border-hub-gold/15">
              <Bell size={20} />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base">Notifications</h1>
              <p className="text-xs text-gray-500">Updates from study groups, exams, and coaches</p>
            </div>
          </div>
          {notifications.some(n => !n.is_read) && (
            <button onClick={markAllRead} className="text-xs text-hub-gold hover:underline flex items-center gap-1">
              <CheckCircle2 size={13} /> Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className="divide-y divide-hub-dark-border/40 min-h-[300px]">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="w-6 h-6 border-2 border-hub-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-20">
              <Bell size={36} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 font-semibold mb-1">All caught up!</p>
              <p className="text-xs text-gray-600">No new notifications at this time.</p>
            </div>
          ) : (
            notifications.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => markAsRead(n.id)}
                className={`p-5 flex items-start gap-4 transition-colors relative group hover:bg-hub-dark-surface cursor-pointer ${
                  !n.is_read ? 'bg-hub-navy/20' : ''
                }`}
              >
                {!n.is_read && (
                  <span className="w-1.5 h-1.5 bg-hub-gold rounded-full absolute left-2.5 top-1/2 -translate-y-1/2" />
                )}

                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0 ${BGS[n.notification_type] || 'bg-hub-dark-bg border-hub-dark-border'}`}>
                  {ICONS[n.notification_type] || <Bell size={16} />}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">{n.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-gray-500 block mt-1.5">{new Date(n.created_at).toLocaleDateString()}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(n.id);
                  }}
                  className="p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
