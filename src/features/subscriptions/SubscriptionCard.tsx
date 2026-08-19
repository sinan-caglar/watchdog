import React from 'react';
import { Clock, ShieldX, Edit3, Trash2, CreditCard, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import type { Subscription } from '../../types';
import { formatCurrency, formatDate, getDaysUntil } from '../../lib/utils';

interface SubscriptionCardProps {
  subscription: Subscription;
  currency: string;
  onCancelClick: (sub: Subscription) => void;
  onEditClick: (sub: Subscription) => void;
  onDeleteClick: (subId: string) => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription: sub,
  currency,
  onCancelClick,
  onEditClick,
  onDeleteClick
}) => {
  const daysLeft = getDaysUntil(sub.next_charge_date);
  const isTrial = sub.type === 'trial' || sub.status === 'trial';
  const isCancelled = sub.status === 'cancelled';
  const isUrgent = (isTrial || daysLeft <= 3) && !isCancelled;

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case 'streaming': return 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300';
      case 'software': return 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300';
      case 'fitness': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300';
      case 'food': return 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300';
      case 'news': return 'bg-pink-100 text-pink-700 dark:bg-pink-950/80 dark:text-pink-300';
      case 'gaming': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300';
      case 'cloud': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div
      className={`group relative rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between ${
        isCancelled
          ? 'border-slate-200 dark:border-slate-800/60 opacity-60'
          : isUrgent
          ? 'border-rose-300 dark:border-rose-800/80 ring-2 ring-rose-500/20 shadow-lg shadow-rose-500/5'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg text-white shrink-0 shadow-sm ${
              isCancelled ? 'bg-slate-400' : isTrial ? 'bg-gradient-to-tr from-rose-500 to-amber-500' : 'bg-gradient-to-tr from-teal-500 to-emerald-600'
            }`}>
              {sub.name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider ${getCategoryBadgeColor(sub.category)}`}>
                  {sub.category}
                </span>

                {isCancelled && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    Cancelled
                  </span>
                )}

                {isTrial && !isCancelled && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-rose-500 text-white animate-pulse">
                    Free Trial
                  </span>
                )}
                {sub.price_increased && !isCancelled && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-500 text-white flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +{sub.price_increase_percentage}% Hike
                  </span>
                )}
              </div>

              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                {sub.name}
              </h3>
            </div>
          </div>

          {/* Action Menu Buttons */}
          <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEditClick(sub)}
              aria-label={`Edit ${sub.name}`}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteClick(sub.id)}
              aria-label={`Delete ${sub.name}`}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cost & Cycle Banner */}
        <div className="mt-3.5 flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {formatCurrency(sub.cost, sub.currency || currency)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">
              / {sub.billing_cycle}
            </span>
            {sub.price_increased && sub.previous_cost && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                Increased from {formatCurrency(sub.previous_cost, sub.currency || currency)} (+{sub.price_increase_percentage}%)
              </p>
            )}
          </div>

          {/* Payment Method Badge */}
          {sub.payment_method_label && (
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
              <CreditCard className="w-3 h-3 text-slate-400" />
              <span>{sub.payment_method_label}</span>
            </span>
          )}
        </div>

        {/* Next Charge / Countdown Info */}
        {!isCancelled && (
          <div className={`mt-3 p-2.5 rounded-xl text-xs flex items-center justify-between font-semibold ${
            isUrgent
              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800/60'
              : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
          }`}>
            <span className="flex items-center gap-1.5">
              <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
              <span>{isTrial ? 'Trial Converts:' : 'Next Charge:'} {formatDate(sub.next_charge_date)}</span>
            </span>

            <span className={`font-bold ${isUrgent ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-slate-500 dark:text-slate-400'}`}>
              {daysLeft === 0 ? 'TODAY' : daysLeft === 1 ? 'TOMORROW' : `in ${daysLeft} days`}
            </span>
          </div>
        )}

        {/* Personal Notes preview if present */}
        {sub.notes && (
          <p className="text-[11px] italic text-slate-500 dark:text-slate-400 mt-2 line-clamp-1">
            "{sub.notes}"
          </p>
        )}
      </div>

      {/* Main Action Button */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        {!isCancelled ? (
          <button
            onClick={() => onCancelClick(sub)}
            className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm active:scale-95 ${
              isUrgent
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                : 'bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900'
            }`}
          >
            <ShieldX className="w-4 h-4" />
            <span>Cancel Now & Save {formatCurrency(sub.cost, sub.currency || currency)}</span>
          </button>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-1 text-center py-1">
            <div className="flex items-center space-x-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>Saved {formatCurrency(sub.saved_amount_estimate || sub.cost * 12, currency)}!</span>
            </div>
            {sub.cancellation_ref_number && (
              <div className="flex items-center space-x-1 text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>Proof Ref: {sub.cancellation_ref_number}</span>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
