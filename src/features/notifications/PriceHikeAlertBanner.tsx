import React from 'react';
import { TrendingUp, ShieldX, Check, MessageSquareQuote } from 'lucide-react';
import type { Subscription } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface PriceHikeAlertBannerProps {
  subscriptions: Subscription[];
  currency: string;
  onCancelClick: (sub: Subscription) => void;
  onKeepClick: (sub: Subscription) => void;
  onNegotiateClick: () => void;
}

export const PriceHikeAlertBanner: React.FC<PriceHikeAlertBannerProps> = ({
  subscriptions,
  currency,
  onCancelClick,
  onKeepClick,
  onNegotiateClick
}) => {
  const priceHikeSubs = subscriptions.filter(s => s.status !== 'cancelled' && Boolean(s.price_increased));

  if (priceHikeSubs.length === 0) return null;

  return (
    <div className="space-y-3">
      {priceHikeSubs.map(sub => (
        <div
          key={sub.id}
          className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/80 text-amber-950 dark:text-amber-100 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-bold flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 text-[10px] font-black uppercase">
                  Price Hike Detected
                </span>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                  +{sub.price_increase_percentage}% Increase
                </span>
              </div>

              <h4 className="font-black text-sm sm:text-base mt-0.5">
                {sub.name} price increased from {formatCurrency(sub.previous_cost || sub.cost, sub.currency || currency)} → {formatCurrency(sub.cost, sub.currency || currency)}
              </h4>
            </div>
          </div>

          {/* 3 Action Buttons: Cancel / Keep / Negotiate */}
          <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
            <button
              onClick={() => onCancelClick(sub)}
              aria-label={`Cancel ${sub.name} due to price hike`}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center space-x-1 transition-colors"
            >
              <ShieldX className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>

            <button
              onClick={onNegotiateClick}
              aria-label={`Open retention scripts to negotiate bill for ${sub.name}`}
              className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs flex items-center space-x-1 transition-colors"
            >
              <MessageSquareQuote className="w-3.5 h-3.5" />
              <span>Negotiate</span>
            </button>

            <button
              onClick={() => onKeepClick(sub)}
              aria-label={`Keep subscription ${sub.name} at new price`}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs flex items-center space-x-1 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Keep</span>
            </button>
          </div>

        </div>
      ))}
    </div>
  );
};
