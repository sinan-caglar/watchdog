import React, { useState } from 'react';
import { ShieldAlert, ArrowRight, Sparkles, Bell, CheckCircle2 } from 'lucide-react';
import type { Subscription } from '../../types';
import { KNOWN_SERVICES } from '../../lib/knownServicesData';
import { calculateNextChargeDate } from '../../lib/utils';

interface OnboardingFlowProps {
  onComplete: (initialSubs: Partial<Subscription>[]) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSlugList, setSelectedSlugList] = useState<string[]>(['netflix', 'spotify', 'chatgpt-plus']);
  const [pushAlerts, setPushAlerts] = useState(true);

  const toggleService = (slug: string) => {
    if (selectedSlugList.includes(slug)) {
      setSelectedSlugList(selectedSlugList.filter(s => s !== slug));
    } else {
      setSelectedSlugList([...selectedSlugList, slug]);
    }
  };

  const handleFinish = () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Create initial subscription items from selected services
    const initialSubs: Partial<Subscription>[] = selectedSlugList.map(slug => {
      const srv = KNOWN_SERVICES.find(s => s.slug === slug);
      if (!srv) return null;

      const isTrial = slug === 'spotify'; // Make one a trial for quick demonstration
      
      return {
        name: srv.name,
        known_service_id: srv.id,
        category: srv.category,
        cost: srv.default_cost || 9.99,
        currency: 'USD',
        billing_cycle: 'monthly',
        type: isTrial ? 'trial' : 'paid',
        status: isTrial ? 'trial' : 'active',
        start_date: today,
        next_charge_date: calculateNextChargeDate(today, 'monthly'),
        payment_method_label: 'Default Card',
        cancellation_url: srv.cancellation_url,
        cancellation_steps: srv.cancellation_steps,
        cancellation_difficulty: srv.cancellation_difficulty
      };
    }).filter(Boolean) as Partial<Subscription>[];

    onComplete(initialSubs);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white font-black text-sm flex items-center justify-center">
              {step}
            </div>
            <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
              Step {step} of 3
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            {[1, 2, 3].map(i => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  step === i ? 'bg-emerald-500 scale-125' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Welcome & Setup */}
        {step === 1 && (
          <div className="space-y-4 text-center py-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/20">
              <ShieldAlert className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Welcome to Watchdog!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Never lose money to forgotten free trials or tricky auto-renewals again. We relentlessly warn you before money leaves your account and make cancellation 1-tap fast.
              </p>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Quick-Add Initial Subscriptions */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Pick Your First 3 Subscriptions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select common services you use to instantly track their renewals and cancellation guides:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {KNOWN_SERVICES.slice(0, 10).map(srv => {
                const isSelected = selectedSlugList.includes(srv.slug);
                return (
                  <button
                    key={srv.slug}
                    type="button"
                    onClick={() => toggleService(srv.slug)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{srv.name}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <span>Continue with {selectedSlugList.length} Selected</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 3: Notification Preferences */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Set Reminder Schedule
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                By default, Watchdog sends urgent warnings <span className="font-bold text-emerald-600 dark:text-emerald-400">3 days before</span> any free trial converts or paid subscription renews.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Web Push Notifications
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Alerts straight to your phone browser
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={pushAlerts}
                  onChange={(e) => setPushAlerts(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch My Watchdog Dashboard</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
