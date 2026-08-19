export type CategoryType = 
  | 'streaming'
  | 'software'
  | 'fitness'
  | 'food'
  | 'news'
  | 'gaming'
  | 'cloud'
  | 'other';

export type BillingCycleType = 
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'one_time';

export type SubscriptionType = 'trial' | 'paid' | 'one_time';

export type SubscriptionStatus = 'active' | 'trial' | 'cancelled' | 'paused';

export type CancellationDifficulty = 'easy' | 'medium' | 'hard';

export interface KnownService {
  id: string;
  slug: string;
  name: string;
  domain: string;
  aliases: string[];
  logo_url: string;
  category: CategoryType;
  default_cost?: number;
  default_currency?: string;
  default_billing_cycle?: BillingCycleType;
  cancellation_url: string;
  cancellation_steps: string[];
  cancellation_difficulty: CancellationDifficulty;
  requires_phone_call: boolean;
  cancellation_phone?: string;
  is_app_store?: 'apple' | 'google' | null;
  retention_tips?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  household_id?: string | null;
  known_service_id?: string | null;
  name: string;
  category: CategoryType;
  cost: number;
  currency: string;
  billing_cycle: BillingCycleType;
  type: SubscriptionType;
  status: SubscriptionStatus;
  start_date: string;
  next_charge_date: string;
  trial_end_date?: string | null;
  payment_method_label?: string;
  cancellation_url?: string;
  cancellation_steps?: string[];
  cancellation_difficulty?: CancellationDifficulty;
  notes?: string;
  is_shared?: boolean;
  split_count?: number;
  last_confirmed_at?: string;
  cancelled_at?: string | null;
  saved_amount_estimate?: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  currency: string;
  notification_preferences: {
    email_enabled: boolean;
    push_enabled: boolean;
    default_trial_reminder_days: number[];
    default_paid_reminder_days: number[];
  };
  onboarding_completed: boolean;
  created_at: string;
}

export interface PriceHistoryItem {
  id: string;
  subscription_id: string;
  old_cost: number;
  new_cost: number;
  currency: string;
  changed_at: string;
  notes?: string;
}

export interface ReminderSetting {
  id: string;
  subscription_id: string;
  user_id: string;
  days_before: number;
  channel: 'push' | 'email' | 'both';
  is_active: boolean;
  snoozed_until?: string | null;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  subscription_id?: string;
  title: string;
  body: string;
  type: 'trial_warning' | 'renewal_alert' | 'price_hike' | 'digest';
  read: boolean;
  sent_at: string;
}

export interface BankImportTransaction {
  id: string;
  user_id: string;
  merchant_name: string;
  amount: number;
  currency: string;
  transaction_date: string;
  suggested_service_slug?: string;
  status: 'pending' | 'confirmed' | 'ignored';
  matched_subscription_id?: string;
}

export interface NegotiationScript {
  id: string;
  category: CategoryType | 'telecom' | 'gym';
  title: string;
  script_text: string;
  tips: string[];
}
