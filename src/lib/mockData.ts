import type { Subscription, UserProfile } from '../types';
import { KNOWN_SERVICES } from './knownServicesData';

export const INITIAL_USER: UserProfile = {
  id: 'usr-demo-101',
  email: 'alex.demo@watchdog.app',
  full_name: 'Alex Morgan',
  currency: 'USD',
  notification_preferences: {
    email_enabled: true,
    push_enabled: true,
    default_trial_reminder_days: [3, 1, 0],
    default_paid_reminder_days: [3]
  },
  onboarding_completed: true,
  created_at: new Date().toISOString()
};

const today = new Date();
const addDays = (d: Date, days: number) => {
  const res = new Date(d);
  res.setDate(res.getDate() + days);
  return res.toISOString().split('T')[0];
};

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-demo-1',
    user_id: 'usr-demo-101',
    known_service_id: 'srv-2',
    name: 'Spotify Premium (Free Trial)',
    category: 'streaming',
    cost: 11.99,
    currency: 'USD',
    billing_cycle: 'monthly',
    type: 'trial',
    status: 'trial',
    start_date: addDays(today, -28),
    next_charge_date: addDays(today, 2), // Urgent! Converts in 2 days
    trial_end_date: addDays(today, 2),
    payment_method_label: 'Visa •••• 4242',
    cancellation_url: KNOWN_SERVICES[1].cancellation_url,
    cancellation_steps: KNOWN_SERVICES[1].cancellation_steps,
    cancellation_difficulty: 'medium',
    notes: 'Started 30-day student trial',
    is_shared: false,
    saved_amount_estimate: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sub-demo-2',
    user_id: 'usr-demo-101',
    known_service_id: 'srv-1',
    name: 'Netflix Standard',
    category: 'streaming',
    cost: 15.49,
    currency: 'USD',
    billing_cycle: 'monthly',
    type: 'paid',
    status: 'active',
    start_date: addDays(today, -120),
    next_charge_date: addDays(today, 5), // Renews in 5 days
    payment_method_label: 'Mastercard •••• 8812',
    cancellation_url: KNOWN_SERVICES[0].cancellation_url,
    cancellation_steps: KNOWN_SERVICES[0].cancellation_steps,
    cancellation_difficulty: 'easy',
    notes: 'Shared with family',
    is_shared: true,
    split_count: 2,
    saved_amount_estimate: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sub-demo-3',
    user_id: 'usr-demo-101',
    known_service_id: 'srv-3',
    name: 'ChatGPT Plus',
    category: 'software',
    cost: 20.00,
    currency: 'USD',
    billing_cycle: 'monthly',
    type: 'paid',
    status: 'active',
    start_date: addDays(today, -60),
    next_charge_date: addDays(today, 18),
    payment_method_label: 'Visa •••• 4242',
    cancellation_url: KNOWN_SERVICES[2].cancellation_url,
    cancellation_steps: KNOWN_SERVICES[2].cancellation_steps,
    cancellation_difficulty: 'easy',
    notes: 'For coding and writing',
    saved_amount_estimate: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sub-demo-4',
    user_id: 'usr-demo-101',
    known_service_id: 'srv-4',
    name: 'Adobe Creative Cloud',
    category: 'software',
    cost: 54.99,
    currency: 'USD',
    billing_cycle: 'monthly',
    type: 'paid',
    status: 'active',
    start_date: addDays(today, -300),
    next_charge_date: addDays(today, 12),
    payment_method_label: 'Amex •••• 1004',
    cancellation_url: KNOWN_SERVICES[3].cancellation_url,
    cancellation_steps: KNOWN_SERVICES[3].cancellation_steps,
    cancellation_difficulty: 'hard',
    notes: 'Check retention discounts before cancelling!',
    saved_amount_estimate: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sub-demo-5',
    user_id: 'usr-demo-101',
    known_service_id: 'srv-11',
    name: 'Planet Fitness Gym',
    category: 'fitness',
    cost: 24.99,
    currency: 'USD',
    billing_cycle: 'monthly',
    type: 'paid',
    status: 'active',
    start_date: addDays(today, -200),
    next_charge_date: addDays(today, 22),
    payment_method_label: 'Checking Account',
    cancellation_url: KNOWN_SERVICES[10].cancellation_url,
    cancellation_steps: KNOWN_SERVICES[10].cancellation_steps,
    cancellation_difficulty: 'hard',
    notes: 'Requires in-person visit or certified letter',
    saved_amount_estimate: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sub-demo-6',
    user_id: 'usr-demo-101',
    known_service_id: 'srv-12',
    name: 'HelloFresh Meal Kits',
    category: 'food',
    cost: 65.00,
    currency: 'USD',
    billing_cycle: 'weekly',
    type: 'paid',
    status: 'cancelled',
    start_date: addDays(today, -90),
    next_charge_date: addDays(today, -10),
    cancelled_at: addDays(today, -10),
    saved_amount_estimate: 260.00, // 4 weeks saved!
    cancellation_url: KNOWN_SERVICES[11].cancellation_url,
    cancellation_steps: KNOWN_SERVICES[11].cancellation_steps,
    cancellation_difficulty: 'medium',
    notes: 'Cancelled through app on June 10',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
