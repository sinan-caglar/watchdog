import React from 'react';
import { DollarSign, Calendar, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import type { Subscription } from '../../types';
import { calculateMonthlySpend, formatCurrency } from '../../lib/utils';

interface SummaryCardsProps {
  subscriptions: Subscription[];
  currency: string;
  savedMoney: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  subscriptions,
  currency,
  savedMoney
}) => {
  const activeSubs = subscriptions.filter(s => s.status === 'active' || s.status === 'trial');
  const trialsCount = subscriptions.filter(s => (s.type === 'trial' || s.status === 'trial') && s.status !== 'cancelled').length;
  
  const totalMonthly = activeSubs.reduce((acc, sub) => {
    return acc + calculateMonthlySpend(sub.cost, sub.billing_cycle);
  }, 0);

  const totalYearly = totalMonthly * 12;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      
      {/* Monthly Spend */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Monthly Spend</span>
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
          {formatCurrency(totalMonthly, currency)}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          {activeSubs.length} active item{activeSubs.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Yearly Spend */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Yearly Spend</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
          {formatCurrency(totalYearly, currency)}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          Projected recurring total
        </p>
      </div>

      {/* Money Saved Counter */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/60 dark:to-teal-950/60 border border-emerald-200 dark:border-emerald-800 p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Money Saved
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-2">
          {formatCurrency(savedMoney, currency)}
        </p>
        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
          Saved via Watchdog cancels!
        </p>
      </div>

      {/* Free Trials Tracked */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Trials</span>
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
          {trialsCount}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          {trialsCount > 0 ? 'Under active countdown' : 'No risky trials'}
        </p>
      </div>

    </div>
  );
};
