import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Users, Send, Trash2, Search, RefreshCw, CheckCircle, AlertCircle, X } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

export const NewsletterAdmin: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filtered, setFiltered] = useState<Subscriber[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [composeOpen, setComposeOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });
    if (!error && data) {
      setSubscribers(data);
      setFiltered(data);
    }
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(subscribers.filter(s => s.email.toLowerCase().includes(q)));
  }, [search, subscribers]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(s => s.id)));
    }
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Remove ${selected.size} subscriber(s)?`)) return;
    const ids = Array.from(selected);
    const { error } = await supabase.from('newsletter_subscribers').delete().in('id', ids);
    if (error) {
      showToast('Failed to delete subscribers.', 'error');
    } else {
      showToast(`${ids.length} subscriber(s) removed.`, 'success');
      setSelected(new Set());
      load();
    }
  };

  const getRecipients = (): Subscriber[] => {
    if (selected.size > 0) {
      return subscribers.filter(s => selected.has(s.id) && s.is_active);
    }
    return subscribers.filter(s => s.is_active);
  };

  const sendNewsletter = async () => {
    if (!subject.trim() || !body.trim()) {
      showToast('Please fill in subject and message.', 'error');
      return;
    }
    const recipients = getRecipients();
    if (recipients.length === 0) {
      showToast('No active recipients selected.', 'error');
      return;
    }

    setSendStatus('sending');

    // Build a mailto: link with BCC of all recipients
    // This opens the user's email client pre-filled and ready to send
    const bcc = recipients.map(r => r.email).join(',');
    const mailtoUrl = `mailto:officialscolara@gmail.com?bcc=${encodeURIComponent(bcc)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open the mail client
    window.open(mailtoUrl, '_blank');

    setSendStatus('success');
    showToast(`Email client opened for ${recipients.length} recipient(s).`, 'success');
    setTimeout(() => {
      setSendStatus('idle');
      setComposeOpen(false);
      setSubject('');
      setBody('');
    }, 2000);
  };

  const activeCount = subscribers.filter(s => s.is_active).length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium text-white border ${
          toast.type === 'success' ? 'bg-emerald-900/90 border-emerald-500/30' : 'bg-red-900/90 border-red-500/30'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Mail className="text-primary" size={26} /> Newsletter Manager
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeCount} active subscriber{activeCount !== 1 ? 's' : ''} · {subscribers.length} total
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            onClick={() => setComposeOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
          >
            <Send size={15} /> Compose Email
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Subscribers', value: subscribers.length, icon: Users, color: 'text-primary' },
          { label: 'Active', value: activeCount, icon: CheckCircle, color: 'text-emerald-500' },
          { label: 'Selected', value: selected.size, icon: Mail, color: 'text-violet-500' },
        ].map(stat => (
          <div key={stat.label} className="p-4 rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800/80">
            <stat.icon size={18} className={`${stat.color} mb-2`} />
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800/80 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-gray-100 dark:border-gray-800/60">
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search emails..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>
          {selected.size > 0 && (
            <button onClick={deleteSelected} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-500/20 text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-all">
              <Trash2 size={14} /> Remove {selected.size}
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Mail size={36} className="text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">{search ? 'No subscribers match your search.' : 'No subscribers yet.'}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800/60">
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={selectAll}
                    className="rounded border-gray-300 dark:border-gray-600 accent-primary"
                  />
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 hidden sm:table-cell">Subscribed</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {filtered.map(sub => (
                <tr key={sub.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${selected.has(sub.id) ? 'bg-primary/5' : ''}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(sub.id)}
                      onChange={() => toggleSelect(sub.id)}
                      className="rounded border-gray-300 dark:border-gray-600 accent-primary"
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{sub.email}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                    {new Date(sub.subscribed_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      sub.is_active
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sub.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      {sub.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Compose Modal */}
      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Send size={18} className="text-primary" /> Compose Newsletter
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  From: <span className="font-mono text-primary">officialscolara@gmail.com</span> ·{' '}
                  To: <strong>{getRecipients().length} recipient(s)</strong>
                  {selected.size > 0 && ' (selection)'}
                </p>
              </div>
              <button onClick={() => setComposeOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Subject</label>
                <input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Scolara Monthly Update — June 2026"
                  className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Message</label>
                <textarea
                  rows={10}
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Write your newsletter content here..."
                  className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all resize-none"
                />
              </div>

              <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/20 p-3 text-xs text-amber-700 dark:text-amber-400">
                💡 Clicking "Send" will open your Gmail with all recipients in BCC. Sign in as <strong>officialscolara@gmail.com</strong> and click Send in Gmail to deliver the email.
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setComposeOpen(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={sendNewsletter}
                disabled={sendStatus === 'sending' || !subject.trim() || !body.trim()}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {sendStatus === 'sending' ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Opening Gmail...</>
                ) : sendStatus === 'success' ? (
                  <><CheckCircle size={15} /> Opened!</>
                ) : (
                  <><Send size={15} /> Send to {getRecipients().length} recipient(s)</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
