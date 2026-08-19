import React, { useState } from 'react';
import { X, ExternalLink, Phone, ShieldCheck, AlertOctagon, Sparkles, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Subscription } from '../../types';
import { KNOWN_SERVICES } from '../../lib/knownServicesData';
import { formatCurrency } from '../../lib/utils';

interface CancellationModalProps {
  subscription: Subscription | null;
  currency: string;
  onClose: () => void;
  onConfirmCancelled: (subId: string, savedAmount: number, proofData?: { refNumber?: string; confirmEmail?: string; proofUrl?: string }) => void;
}

export const CancellationModal: React.FC<CancellationModalProps> = ({
  subscription,
  currency,
  onClose,
  onConfirmCancelled
}) => {
  const [isDone, setIsDone] = useState(false);
  const [refNumber, setRefNumber] = useState(subscription?.cancellation_ref_number || '');
  const [confirmEmail, setConfirmEmail] = useState(subscription?.cancellation_confirm_email || '');

  if (!subscription) return null;

  // Match known service data if available
  const knownMatch = KNOWN_SERVICES.find(
    s => s.id === subscription.known_service_id || s.slug === subscription.known_service_id || s.name.toLowerCase() === subscription.name.toLowerCase()
  );

  const cancelUrl = subscription.cancellation_url || knownMatch?.cancellation_url || `https://www.google.com/search?q=how+to+cancel+${encodeURIComponent(subscription.name)}`;
  const steps = subscription.cancellation_steps || knownMatch?.cancellation_steps || [
    'Log into your account settings page for this service.',
    'Navigate to Billing, Membership, or Subscription management.',
    'Click Cancel Subscription / End Free Trial.',
    'Complete retention screens until official cancellation receipt is displayed.'
  ];
  const difficulty = subscription.cancellation_difficulty || knownMatch?.cancellation_difficulty || 'medium';
  const isPhoneRequired = knownMatch?.requires_phone_call;
  const phone = knownMatch?.cancellation_phone;
  const isAppStore = knownMatch?.is_app_store;
  const retentionTips = knownMatch?.retention_tips;

  const handleMarkCancelled = () => {
    // Trigger celebration confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    setIsDone(true);
    // Estimate annual savings from cancelling
    const estimatedSaved = subscription.cost * (subscription.billing_cycle === 'weekly' ? 52 : subscription.billing_cycle === 'yearly' ? 1 : 12);
    
    setTimeout(() => {
      onConfirmCancelled(subscription.id, estimatedSaved, {
        refNumber,
        confirmEmail
      });
      onClose();
    }, 1500);
  };

  const getDifficultyBadge = () => {
    switch (difficulty) {
      case 'easy':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs">Easy Online Cancel</span>;
      case 'medium':
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-xs">Medium (Multiple Screens)</span>;
      case 'hard':
        return <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold text-xs">Hard (Phone/Chat Required)</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-extrabold text-[10px] uppercase">
                Cancellation Guide
              </span>
              {getDifficultyBadge()}
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              Cancel {subscription.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close cancellation guide modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Success state celebration */}
          {isDone ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Subscription Cancelled!
              </h3>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold">
                You saved estimated {formatCurrency(subscription.cost * 12, currency)}/year! Money protected.
              </p>
            </div>
          ) : (
            <>
              {/* App Store Special Banner */}
              {isAppStore && (
                <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" /> Apple / Google Store Managed
                  </p>
                  <p>
                    This subscription was purchased via mobile app store. You must cancel it directly in your device account settings page.
                  </p>
                </div>
              )}

              {/* Phone Requirement Warning */}
              {isPhoneRequired && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-amber-800 dark:text-amber-300">
                    <AlertOctagon className="w-4 h-4 text-amber-600" />
                    <span>Phone Call / Certified Mail Enforced</span>
                  </div>
                  <p>
                    This service deliberately restricts online cancellations. Call customer support directly:
                  </p>
                  {phone && (
                    <a
                      href={`tel:${phone}`}
                      aria-label={`Call customer support for ${subscription.name} at ${phone}`}
                      className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call {phone}</span>
                    </a>
                  )}
                </div>
              )}

              {/* Step-by-Step Instructions */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-slate-400">
                  Step-by-Step Instructions
                </h4>
                <ol className="space-y-2">
                  {steps.map((step, idx) => (
                    <li
                      key={idx}
                      className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Secret Retention Tip */}
              {retentionTips && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                    <Sparkles className="w-3.5 h-3.5" /> Retention Secret Tip:
                  </p>
                  <p className="text-[11px]">{retentionTips}</p>
                </div>
              )}

              {/* Cancellation Proof Vault Section */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Cancellation Proof & Receipt (Optional)</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Protect yourself against wrongful post-cancellation charges (crucial for gyms & annual contracts)
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Confirmation Ref #
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. REF-984210"
                      value={refNumber}
                      onChange={(e) => setRefNumber(e.target.value)}
                      aria-label="Cancellation confirmation reference number"
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Confirmation Sent To
                    </label>
                    <input
                      type="email"
                      placeholder="you@email.com"
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      aria-label="Confirmation email address"
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Direct Deep-Link Action Button */}
              <div className="pt-2">
                <a
                  href={cancelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open direct cancellation page for ${subscription.name}`}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
                >
                  <span>Open Direct Cancellation Page</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </>
          )}

        </div>

        {/* Footer Actions */}
        {!isDone && (
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
              Finished cancelling on merchant site?
            </p>

            <button
              onClick={handleMarkCancelled}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-xs hover:opacity-90 transition-opacity flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
              <span>Mark as Cancelled in Watchdog</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
