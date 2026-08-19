import React from 'react';
import { AlertTriangle, Clock, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { Subscription } from '../../types';
import { getDaysUntil, formatCurrency } from '../../lib/utils';

interface UrgentAlertsBannerProps {
  subscriptions: Subscription[];
  currency: string;
  onCancelClick: (sub: Subscription) => void;
}

export const UrgentAlertsBanner: React.FC<UrgentAlertsBannerProps> = ({
  subscriptions,
  currency,
  onCancelClick
}) => {
  // Find urgent free trials (converts in <= 3 days)
  const urgentTrials = subscriptions.filter(
    s => (s.type === 'trial' || s.status === 'trial') && s.status !== 'cancelled' && getDaysUntil(s.next_charge_date) <= 3
  );

  // Find upcoming renewals (next 7 days, non-trial or upcoming paid)
  const upcomingRenewals = subscriptions.filter(
    s => s.status !== 'cancelled' && s.status !== 'trial' && getDaysUntil(s.next_charge_date) >= 0 && getDaysUntil(s.next_charge_date) <= 7
  );

  if (urgentTrials.length === 0 && upcomingRenewals.length === 0) {
    return (
      <div className="w-full rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/60 p-4 sm:p-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-emerald-900 dark:text-emerald-100">
              All Clear! No Urgent Charges Next 7 Days
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Your watchdog is monitoring all free trials & renewals. Money in your wallet is safe!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Urgent Free Trial Alert */}
      {urgentTrials.map(sub => {
        const daysLeft = getDaysUntil(sub.next_charge_date);
        const daysText = daysLeft === 0 ? 'TODAY' : daysLeft === 1 ? 'TOMORROW' : `in ${daysLeft} days`;

        return (
          <div
            key={sub.id}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-red-700 text-white p-4 sm:p-5 shadow-xl shadow-rose-500/20 border border-rose-400/40 animate-pulse-slow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6 text-white stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider">
                      Urgently Cancel
                    </span>
                    <span className="text-xs text-rose-100 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Converts {daysText}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-lg sm:text-xl text-white mt-0.5">
                    {sub.name} Free Trial
                  </h3>
                  <p className="text-xs text-rose-100 mt-1">
                    Will auto-charge <span className="font-bold underline text-white">{formatCurrency(sub.cost, sub.currency || currency)}</span> on {sub.next_charge_date}. Cancel now before money leaves your account!
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => onCancelClick(sub)}
                  className="px-4 py-2.5 rounded-xl bg-white text-rose-700 hover:bg-rose-50 font-black text-xs sm:text-sm shadow-lg transition-transform active:scale-95 flex items-center space-x-1.5"
                >
                  <span>Cancel Now</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Upcoming Paid Renewals Alert */}
      {upcomingRenewals.map(sub => {
        const daysLeft = getDaysUntil(sub.next_charge_date);
        return (
          <div
            key={sub.id}
            className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 p-3.5 sm:p-4 flex items-center justify-between gap-3 text-amber-900 dark:text-amber-100"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold">
                  {sub.name} renews in {daysLeft === 0 ? 'today' : `${daysLeft} days`} ({formatCurrency(sub.cost, sub.currency || currency)})
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                  Payment method: {sub.payment_method_label || 'Default Card'}
                </p>
              </div>
            </div>

            <button
              onClick={() => onCancelClick(sub)}
              className="px-3 py-1.5 rounded-lg bg-amber-200 dark:bg-amber-800/80 hover:bg-amber-300 font-semibold text-xs text-amber-950 dark:text-amber-100 shrink-0 transition-colors"
            >
              Review / Cancel
            </button>
          </div>
        );
      })}
    </div>
  );
};
