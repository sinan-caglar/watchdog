import React from 'react';
import { Calendar, ShieldX } from 'lucide-react';
import type { Subscription } from '../../types';
import { getDaysUntil, formatCurrency } from '../../lib/utils';

interface RenewalCalendarProps {
  subscriptions: Subscription[];
  currency: string;
  onCancelClick: (sub: Subscription) => void;
}

export const RenewalCalendar: React.FC<RenewalCalendarProps> = ({
  subscriptions,
  currency,
  onCancelClick
}) => {
  const activeSubs = subscriptions.filter(s => s.status !== 'cancelled');

  // Sort by next charge date
  const sortedSubs = [...activeSubs].sort(
    (a, b) => new Date(a.next_charge_date).getTime() - new Date(b.next_charge_date).getTime()
  );

  // Group subscriptions by Month + Day date key (e.g. "AUG 20")
  const dateGroups: Record<string, Subscription[]> = {};
  sortedSubs.forEach(sub => {
    const d = new Date(sub.next_charge_date);
    const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = d.getDate().toString().padStart(2, '0');
    const dateKey = `${month} ${day}`;

    if (!dateGroups[dateKey]) {
      dateGroups[dateKey] = [];
    }
    dateGroups[dateKey].push(sub);
  });

  const groupKeys = Object.keys(dateGroups);

  if (groupKeys.length === 0) {
    return (
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-center text-slate-500 text-xs">
        No upcoming renewals scheduled in calendar.
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Renewal & Trial Calendar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chronological timeline of upcoming charges
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {sortedSubs.length} items scheduled
        </span>
      </div>

      {/* Calendar Timeline List */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
        {groupKeys.map(dateKey => {
          const items = dateGroups[dateKey];
          return (
            <div key={dateKey} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
              
              {/* Date Box */}
              <div className="w-20 shrink-0 px-3 py-2 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white text-center font-black">
                <span className="block text-[10px] text-emerald-400 tracking-wider font-extrabold">
                  {dateKey.split(' ')[0]}
                </span>
                <span className="block text-xl leading-none mt-0.5">
                  {dateKey.split(' ')[1]}
                </span>
              </div>

              {/* Items for this date */}
              <div className="flex-1 space-y-2">
                {items.map(sub => {
                  const daysLeft = getDaysUntil(sub.next_charge_date);
                  const isTrial = sub.type === 'trial' || sub.status === 'trial';
                  const isUrgent = isTrial || daysLeft <= 3;

                  return (
                    <div
                      key={sub.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                        isUrgent
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-9 h-9 rounded-xl font-bold text-xs text-white flex items-center justify-center shrink-0 ${
                          isTrial ? 'bg-rose-500' : 'bg-slate-700'
                        }`}>
                          {sub.name.charAt(0)}
                        </div>

                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                              {sub.name}
                            </span>
                            {isTrial && (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-rose-500 text-white">
                                Free Trial
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {daysLeft === 0 ? 'Charging TODAY' : daysLeft === 1 ? 'Charging TOMORROW' : `In ${daysLeft} days`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="font-black text-sm text-slate-900 dark:text-white">
                          {formatCurrency(sub.cost, sub.currency || currency)}
                        </span>

                        <button
                          onClick={() => onCancelClick(sub)}
                          aria-label={`Cancel ${sub.name}`}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-xs hover:opacity-90 transition-opacity shrink-0 flex items-center space-x-1"
                        >
                          <ShieldX className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
