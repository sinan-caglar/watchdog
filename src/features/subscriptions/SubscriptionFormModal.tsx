import React, { useState, useEffect } from 'react';
import { X, Link2, Sparkles } from 'lucide-react';
import type { Subscription, CategoryType, BillingCycleType, KnownService } from '../../types';
import { KNOWN_SERVICES } from '../../lib/knownServicesData';
import { calculateNextChargeDate, matchUrlToKnownService, CURRENCY_SYMBOLS } from '../../lib/utils';

interface SubscriptionFormModalProps {
  initialData?: Subscription | null;
  currency: string;
  onClose: () => void;
  onSave: (data: Partial<Subscription>) => void;
}

export const SubscriptionFormModal: React.FC<SubscriptionFormModalProps> = ({
  initialData,
  currency: defaultCurrency,
  onClose,
  onSave
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [knownServiceId, setKnownServiceId] = useState<string | undefined>(initialData?.known_service_id || undefined);
  const [cost, setCost] = useState<number>(initialData?.cost || 9.99);
  const [currency, setCurrency] = useState<string>(initialData?.currency || defaultCurrency);
  const [billingCycle, setBillingCycle] = useState<BillingCycleType>(initialData?.billing_cycle || 'monthly');
  const [isTrial, setIsTrial] = useState<boolean>(initialData?.type === 'trial' || initialData?.status === 'trial');
  const [startDate, setStartDate] = useState<string>(initialData?.start_date || new Date().toISOString().split('T')[0]);
  const [nextChargeDate, setNextChargeDate] = useState<string>(initialData?.next_charge_date || new Date().toISOString().split('T')[0]);
  const [paymentLabel, setPaymentLabel] = useState<string>(initialData?.payment_method_label || 'Visa •••• 4242');
  const [category, setCategory] = useState<CategoryType>(initialData?.category || 'streaming');
  const [notes, setNotes] = useState<string>(initialData?.notes || '');
  const [urlInput, setUrlInput] = useState<string>('');

  // Service Autocomplete Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredServices = KNOWN_SERVICES.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto calculate next charge date when start date or cycle changes
  useEffect(() => {
    if (!initialData) {
      const calculated = calculateNextChargeDate(startDate, billingCycle);
      setNextChargeDate(calculated);
    }
  }, [startDate, billingCycle, initialData]);

  // Quick URL Auto Matcher
  const handleUrlMatch = (url: string) => {
    setUrlInput(url);
    const match = matchUrlToKnownService(url, KNOWN_SERVICES);
    if (match) {
      applyKnownService(match);
    }
  };

  const applyKnownService = (srv: KnownService) => {
    setName(srv.name);
    setKnownServiceId(srv.id);
    setCategory(srv.category);
    if (srv.default_cost) setCost(srv.default_cost);
    if (srv.default_billing_cycle) setBillingCycle(srv.default_billing_cycle);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      known_service_id: knownServiceId,
      cost: Number(cost),
      currency,
      billing_cycle: billingCycle,
      type: isTrial ? 'trial' : 'paid',
      status: isTrial ? 'trial' : 'active',
      start_date: startDate,
      next_charge_date: nextChargeDate,
      trial_end_date: isTrial ? nextChargeDate : null,
      payment_method_label: paymentLabel,
      category,
      notes,
      cancellation_url: KNOWN_SERVICES.find(s => s.id === knownServiceId)?.cancellation_url,
      cancellation_steps: KNOWN_SERVICES.find(s => s.id === knownServiceId)?.cancellation_steps,
      cancellation_difficulty: KNOWN_SERVICES.find(s => s.id === knownServiceId)?.cancellation_difficulty
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {initialData ? 'Edit Subscription' : 'Add Subscription or Trial'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close subscription form modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Quick Paste URL Matcher */}
          {!initialData && (
            <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-2">
              <label className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Quick-Match by Website URL or Service Name</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Paste URL (e.g. netflix.com or spotify.com)"
                  aria-label="Quick-Match by Website URL or Service Name"
                  value={urlInput}
                  onChange={(e) => handleUrlMatch(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <Link2 className="absolute right-3 top-2.5 w-4 h-4 text-teal-500" />
              </div>
            </div>
          )}

          {/* Service Name & Autocomplete */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Service Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Netflix, Spotify, ChatGPT Plus"
              aria-label="Service Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            {/* Suggestions dropdown */}
            {showSuggestions && searchQuery.trim().length > 0 && filteredServices.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl">
                {filteredServices.map(srv => (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => applyKnownService(srv)}
                    className="w-full px-3.5 py-2 text-left text-xs hover:bg-emerald-50 dark:hover:bg-slate-700 flex items-center justify-between transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                  >
                    <div className="font-semibold text-slate-800 dark:text-slate-100">
                      {srv.name}
                    </div>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {srv.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Type Toggle: Free Trial vs Paid */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Is this currently a Free Trial?
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                We will aggressively alert you 3 days before it converts to paid
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isTrial}
                onChange={(e) => setIsTrial(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Cost & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Cost *
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                value={cost}
                onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {Object.keys(CURRENCY_SYMBOLS).map(c => (
                  <option key={c} value={c}>{c} ({CURRENCY_SYMBOLS[c]})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Billing Cycle & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Billing Cycle
              </label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as BillingCycleType)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="one_time">One-time</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize"
              >
                <option value="streaming">Streaming</option>
                <option value="software">Software</option>
                <option value="fitness">Fitness</option>
                <option value="food">Food</option>
                <option value="news">News</option>
                <option value="gaming">Gaming</option>
                <option value="cloud">Cloud</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isTrial ? 'Trial Conversion Date *' : 'Next Charge Date *'}
              </label>
              <input
                type="date"
                required
                value={nextChargeDate}
                onChange={(e) => setNextChargeDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Payment Method Display Label */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Payment Method Label (Display Only)
            </label>
            <input
              type="text"
              placeholder="e.g. Visa •••• 4242, PayPal, Apple Pay"
              value={paymentLabel}
              onChange={(e) => setPaymentLabel(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Never enter real card numbers. Enter a label to identify which card is billed.
            </p>
          </div>

          {/* Personal Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Personal Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Student discount applied, check annual deal next month..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 transition-all"
            >
              {initialData ? 'Save Changes' : 'Track Subscription'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
