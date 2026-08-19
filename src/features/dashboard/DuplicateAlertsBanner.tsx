import React from 'react';
import { ArrowRight, ShieldAlert } from 'lucide-react';
import type { Subscription } from '../../types';

interface DuplicateAlertsBannerProps {
  duplicates: { sub1: Subscription; sub2: Subscription }[];
  onReviewDuplicate: (sub: Subscription) => void;
}

export const DuplicateAlertsBanner: React.FC<DuplicateAlertsBannerProps> = ({
  duplicates,
  onReviewDuplicate
}) => {
  if (duplicates.length === 0) return null;

  return (
    <div className="space-y-2">
      {duplicates.map(({ sub1, sub2 }, idx) => (
        <div
          key={idx}
          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white font-bold flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Potential Duplicate Detected
              </span>
              <p className="text-xs font-bold mt-0.5">
                You are paying for both <span className="underline">{sub1.name}</span> ({sub1.billing_cycle}) and <span className="underline">{sub2.name}</span> ({sub2.billing_cycle})!
              </p>
            </div>
          </div>

          <button
            onClick={() => onReviewDuplicate(sub2)}
            aria-label={`Review potential duplicate ${sub2.name}`}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shrink-0 flex items-center space-x-1 transition-colors self-end sm:self-center"
          >
            <span>Cancel Duplicate</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
