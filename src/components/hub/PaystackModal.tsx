import React, { useState } from 'react';
import { X, CreditCard, Shield, CheckCircle, Loader2, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { initiatePaystackPayment, generatePaystackReference, HUB_JOIN_FEE_KOBO, HUB_JOIN_FEE_NAIRA } from '../../lib/paystack';
import { supabase } from '../../lib/supabase';
import { useHub } from '../../context/HubContext';

interface PaystackModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  tutorName?: string;
  onSuccess: () => void;
}

export const PaystackModal: React.FC<PaystackModalProps> = ({
  isOpen, onClose, groupId, groupName, onSuccess,
}) => {
  const { hubUser, refreshHubUser } = useHub();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!hubUser) return;
    setLoading(true);
    setError(null);

    const reference = generatePaystackReference(hubUser.id, groupId);

    try {
      await initiatePaystackPayment({
        email: hubUser.email,
        amount: HUB_JOIN_FEE_KOBO,
        reference,
        metadata: {
          group_id: groupId,
          user_id: hubUser.id,
          payment_type: 'hub_group_join',
        },
        onSuccess: async (ref) => {
          // Record membership with payment
          const { error: memberError } = await supabase
            .from('hub_group_members')
            .upsert({
              group_id: groupId,
              user_id: hubUser.id,
              role: 'member',
              payment_status: 'paid',
              paystack_reference: ref,
              amount_paid_naira: HUB_JOIN_FEE_NAIRA,
              paid_at: new Date().toISOString(),
            });

          if (memberError) {
            setError('Payment was successful but we could not add you to the group. Please contact support.');
            setLoading(false);
            return;
          }

          // Increment member count
          try { await supabase.rpc('increment_member_count', { group_id_param: groupId }); } catch { /* ignore */ }

          // Create welcome notification
          try {
            await supabase.from('hub_notifications').insert({
              user_id: hubUser.id,
              notification_type: 'group_joined',
              title: '🎉 Welcome to the group!',
              body: `You've successfully joined "${groupName}". Start exploring resources and upcoming exams!`,
              payload: { group_id: groupId },
            });
          } catch { /* ignore */ }

          setSuccess(true);
          setLoading(false);
          await refreshHubUser();
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 2000);
        },
        onClose: () => {
          setLoading(false);
        },
      });
    } catch {
      setError('Failed to initialize payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="bg-hub-dark-surface border border-hub-dark-border rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white p-1">
              <X size={18} />
            </button>

            {success ? (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle size={32} className="text-green-400" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">You're In! 🎉</h3>
                <p className="text-gray-400 text-sm">Successfully joined <span className="text-hub-gold">{groupName}</span>. Taking you there now...</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-hub-gold to-hub-aqua flex items-center justify-center">
                    <GraduationCap size={22} className="text-hub-navy" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Join Study Group</h3>
                    <p className="text-xs text-gray-400">{groupName}</p>
                  </div>
                </div>

                {/* Fee breakdown */}
                <div className="bg-hub-dark-bg rounded-xl border border-hub-dark-border p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">One-time access fee</span>
                    <span className="text-sm text-white font-semibold">₦{HUB_JOIN_FEE_NAIRA.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Unlimited group access</span>
                    <span className="text-xs text-hub-gold font-semibold">Forever ✓</span>
                  </div>
                  <div className="border-t border-hub-dark-border mt-3 pt-3 flex justify-between items-center">
                    <span className="font-bold text-white">Total</span>
                    <span className="text-xl font-extrabold text-hub-gold">₦{HUB_JOIN_FEE_NAIRA.toLocaleString()}</span>
                  </div>
                </div>

                {/* What you get */}
                <div className="mb-5 space-y-2">
                  {[
                    'Unlimited mock exams & practice tests',
                    'All past questions & study materials',
                    'Live group chat with tutor & students',
                    'AI-powered performance analysis',
                    'Tutor announcements & resources',
                  ].map(feature => (
                    <div key={feature} className="flex items-center gap-2 text-xs text-gray-400">
                      <CheckCircle size={13} className="text-hub-gold flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-900/20 border border-red-700/40 rounded-lg text-xs text-red-400">
                    {error}
                  </div>
                )}

                {/* Pay button */}
                <button
                  onClick={handlePayment}
                  disabled={loading || !hubUser}
                  className="w-full py-3.5 rounded-xl bg-hub-gold text-hub-navy font-bold text-sm flex items-center justify-center gap-2 hover:bg-hub-gold-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-hub-gold/20 active:scale-95"
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Processing...</>
                  ) : (
                    <><CreditCard size={16} /> Pay ₦{HUB_JOIN_FEE_NAIRA.toLocaleString()} via Paystack</>
                  )}
                </button>

                {!hubUser && (
                  <p className="text-center text-xs text-gray-500 mt-3">
                    Please <a href="/hub/login" className="text-hub-gold underline">sign in</a> to continue.
                  </p>
                )}

                {/* Security note */}
                <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] text-gray-600">
                  <Shield size={11} />
                  Secured by Paystack · SSL Encrypted
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
