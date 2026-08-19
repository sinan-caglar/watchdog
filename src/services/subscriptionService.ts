import type { Subscription } from '../types';
import { INITIAL_SUBSCRIPTIONS } from '../lib/mockData';

const SUBSCRIPTIONS_KEY = 'watchdog_subscriptions';
const SAVED_MONEY_KEY = 'watchdog_saved_money';

export const subscriptionService = {
  loadSubscriptions(): Subscription[] {
    const saved = localStorage.getItem(SUBSCRIPTIONS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTIONS;
  },

  saveSubscriptions(subscriptions: Subscription[]): void {
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
  },

  loadSavedMoney(): number {
    const saved = localStorage.getItem(SAVED_MONEY_KEY);
    if (saved) return parseFloat(saved);
    return INITIAL_SUBSCRIPTIONS.filter(s => s.status === 'cancelled')
      .reduce((acc, s) => acc + (s.saved_amount_estimate || s.cost * 12), 0);
  },

  saveSavedMoney(amount: number): void {
    localStorage.setItem(SAVED_MONEY_KEY, amount.toString());
  },

  createSubscription(data: Partial<Subscription>, userId: string, currency: string): Subscription {
    const today = new Date().toISOString().split('T')[0];
    return {
      id: `sub-${Date.now()}`,
      user_id: userId,
      name: data.name || 'Untitled Subscription',
      category: data.category || 'other',
      cost: data.cost || 0,
      currency: data.currency || currency,
      billing_cycle: data.billing_cycle || 'monthly',
      type: data.type || 'paid',
      status: data.status || 'active',
      start_date: data.start_date || today,
      next_charge_date: data.next_charge_date || today,
      trial_end_date: data.trial_end_date,
      payment_method_label: data.payment_method_label,
      cancellation_url: data.cancellation_url,
      cancellation_steps: data.cancellation_steps,
      cancellation_difficulty: data.cancellation_difficulty,
      notes: data.notes,
      cancellation_ref_number: data.cancellation_ref_number,
      cancellation_proof_url: data.cancellation_proof_url,
      cancellation_confirm_email: data.cancellation_confirm_email,
      saved_amount_estimate: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  detectDuplicates(subscriptions: Subscription[]): { sub1: Subscription; sub2: Subscription }[] {
    const active = subscriptions.filter(s => s.status !== 'cancelled');
    const duplicates: { sub1: Subscription; sub2: Subscription }[] = [];

    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const name1 = active[i].name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const name2 = active[j].name.toLowerCase().replace(/[^a-z0-9]/g, '');

        if (name1.includes(name2) || name2.includes(name1) || (active[i].known_service_id && active[i].known_service_id === active[j].known_service_id)) {
          duplicates.push({ sub1: active[i], sub2: active[j] });
        }
      }
    }
    return duplicates;
  },

  detectPriceIncreases(subscriptions: Subscription[]): Subscription[] {
    return subscriptions.filter(s => s.status !== 'cancelled' && Boolean(s.price_increased));
  }
};
