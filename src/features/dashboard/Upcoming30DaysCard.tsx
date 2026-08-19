import React from 'react';
import { CalendarClock, Zap, TrendingUp } from 'lucide-react';
import type { Subscription } from '../../types';
import { getDaysUntil, calculateMonthlySpend, formatCurrency } from '../../lib/utils';

interface Upcoming30DaysCardProps {
  subscriptions: Subscription[];
  currency: string;
}

export const Upcoming30DaysCard: React.FC<Upcoming30DaysCardProps> = ({ subscriptions, currency }) => {
  const activeSubs = subscriptions.filter(s => s.status !== 'cancelled');

  // Next 30 days renewals
  const upcoming30Renewals = activeSubs.filter(s => {
    const days = getDaysUntil(s.next_charge_date);
    return days >= 0 && days <= 30 && s.type !== 'trial' && s.status !== 'trial';
  });

  const totalRenewalsSpend = upcoming30Renewals.reduce((acc, sub) => {
    return acc + calculateMonthlySpend(sub.cost, sub.billing_cycle);
  }, 0);

  // Next 30 days trials converting
  const upcoming30Trials = activeSubs.filter(s => {
    const days = getDaysUntil(s.next_charge_date);
    return days >= 0 && days <= 30 && (s.type === 'trial' || s.status === 'trial');
  });

  const totalTrialsRiskCost = upcoming30Trials.reduce((acc, sub) => acc + sub.cost, 0);

  // Price hikes count
  const priceHikeCount = activeSubs.filter(s => s.price_increased).length;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white p-5 sm:p-6 shadow-xl border border-slate-800 space-y-4">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <CalendarClock className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
              Watchdog Summary
            </span>
            <h3 className="text-lg font-black text-white leading-tight">
              Upcoming 30 Days Forecast
            </h3>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black">
          30-Day Window
        </span>
      </div>

      {/* 3 Metric Hero Pills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* Renewals Pill */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Upcoming Renewals
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-white">
              {upcoming30Renewals.length} renewals
            </span>
            <span className="text-sm font-extrabold text-emerald-400">
              {formatCurrency(totalRenewalsSpend, currency)}
            </span>
          </div>
        </div>

        {/* Trials Converting Pill */}
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1">
          <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider block flex items-center gap-1">
            <Zap className="w-3 h-3 text-rose-400 animate-pulse" /> Trials Converting
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-white">
              {upcoming30Trials.length} trials
            </span>
            <span className="text-sm font-extrabold text-rose-400">
              {formatCurrency(totalTrialsRiskCost, currency)}
            </span>
          </div>
        </div>

        {/* Price Increases Pill */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
          <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-amber-400" /> Price Increases
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-white">
              {priceHikeCount} flagged
            </span>
            <span className="text-xs font-bold text-amber-300">
              {priceHikeCount > 0 ? 'Negotiate / Review' : 'No price hikes'}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
