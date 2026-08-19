-- =========================================================================
-- SUPABASE MIGRATION: Subscription & Free Trial Watchdog Schema + RLS
-- Created: 2026-08-19
-- =========================================================================

-- 1. Create PROFILES table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  notification_preferences JSONB NOT NULL DEFAULT '{"email_enabled": true, "push_enabled": true, "default_trial_reminder_days": [3, 1, 0], "default_paid_reminder_days": [3]}'::jsonb,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create HOUSEHOLDS table
CREATE TABLE IF NOT EXISTS public.households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text) from 1 for 8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create HOUSEHOLD_MEMBERS table
CREATE TABLE IF NOT EXISTS public.household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(household_id, user_id)
);

-- 4. Create KNOWN_SERVICES table
CREATE TABLE IF NOT EXISTS public.known_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  aliases TEXT[] NOT NULL DEFAULT '{}',
  logo_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('streaming', 'software', 'fitness', 'food', 'news', 'gaming', 'cloud', 'other')),
  default_cost NUMERIC(10,2),
  default_currency TEXT DEFAULT 'USD',
  default_billing_cycle TEXT DEFAULT 'monthly' CHECK (default_billing_cycle IN ('weekly', 'monthly', 'quarterly', 'yearly', 'one_time')),
  cancellation_url TEXT NOT NULL,
  cancellation_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  cancellation_difficulty TEXT NOT NULL CHECK (cancellation_difficulty IN ('easy', 'medium', 'hard')),
  requires_phone_call BOOLEAN NOT NULL DEFAULT false,
  cancellation_phone TEXT,
  is_app_store TEXT CHECK (is_app_store IN ('apple', 'google', NULL)),
  retention_tips TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create SUBSCRIPTIONS table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  household_id UUID REFERENCES public.households(id) ON DELETE SET NULL,
  known_service_id UUID REFERENCES public.known_services(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('streaming', 'software', 'fitness', 'food', 'news', 'gaming', 'cloud', 'other')),
  cost NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('weekly', 'monthly', 'quarterly', 'yearly', 'one_time')),
  type TEXT NOT NULL DEFAULT 'paid' CHECK (type IN ('trial', 'paid', 'one_time')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trial', 'cancelled', 'paused')),
  start_date DATE NOT NULL,
  next_charge_date DATE NOT NULL,
  trial_end_date DATE,
  payment_method_label TEXT,
  cancellation_url TEXT,
  cancellation_steps JSONB DEFAULT '[]'::jsonb,
  cancellation_difficulty TEXT CHECK (cancellation_difficulty IN ('easy', 'medium', 'hard', NULL)),
  notes TEXT,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  split_count INT NOT NULL DEFAULT 1,
  last_confirmed_at TIMESTAMPTZ DEFAULT now(),
  cancelled_at TIMESTAMPTZ,
  saved_amount_estimate NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create PRICE_HISTORY table
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  old_cost NUMERIC(10,2) NOT NULL,
  new_cost NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);

-- 7. Create REMINDER_SETTINGS table
CREATE TABLE IF NOT EXISTS public.reminder_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  days_before INT NOT NULL DEFAULT 3,
  channel TEXT NOT NULL DEFAULT 'both' CHECK (channel IN ('push', 'email', 'both')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  snoozed_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Create NOTIFICATIONS_LOG table
CREATE TABLE IF NOT EXISTS public.notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'trial_warning' CHECK (type IN ('trial_warning', 'renewal_alert', 'price_hike', 'digest')),
  read BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Create BANK_IMPORT_TRANSACTIONS table
CREATE TABLE IF NOT EXISTS public.bank_import_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  merchant_name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  transaction_date DATE NOT NULL,
  suggested_service_id UUID REFERENCES public.known_services(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'ignored')),
  matched_subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Create EMAIL_SCAN_MATCHES table
CREATE TABLE IF NOT EXISTS public.email_scan_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  detected_amount NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  detected_trial_end DATE,
  email_subject TEXT,
  sender_domain TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Create NEGOTIATION_SCRIPTS table
CREATE TABLE IF NOT EXISTS public.negotiation_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  script_text TEXT NOT NULL,
  tips TEXT[] NOT NULL DEFAULT '{}'
);


-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on ALL tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.known_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_import_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_scan_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negotiation_scripts ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. KNOWN_SERVICES policies (Public Read, Admin Write)
CREATE POLICY "Anyone can view known services" ON public.known_services FOR SELECT USING (true);

-- 3. NEGOTIATION_SCRIPTS policies (Public Read)
CREATE POLICY "Anyone can view negotiation scripts" ON public.negotiation_scripts FOR SELECT USING (true);

-- 4. SUBSCRIPTIONS policies
CREATE POLICY "Users can view own or shared household subscriptions" ON public.subscriptions
  FOR SELECT USING (
    user_id = auth.uid() OR
    household_id IN (
      SELECT household_id FROM public.household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own subscriptions" ON public.subscriptions
  FOR DELETE USING (user_id = auth.uid());

-- 5. HOUSEHOLDS policies
CREATE POLICY "Members can view household" ON public.households FOR SELECT USING (
  id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create household" ON public.households FOR INSERT WITH CHECK (created_by = auth.uid());

-- 6. HOUSEHOLD_MEMBERS policies
CREATE POLICY "Members can view co-members" ON public.household_members FOR SELECT USING (
  household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid())
);
CREATE POLICY "Users can join household" ON public.household_members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Members can leave or delete" ON public.household_members FOR DELETE USING (user_id = auth.uid());

-- 7. REMINDER_SETTINGS policies
CREATE POLICY "Users access own reminder settings" ON public.reminder_settings FOR ALL USING (user_id = auth.uid());

-- 8. NOTIFICATIONS_LOG policies
CREATE POLICY "Users access own notifications log" ON public.notifications_log FOR ALL USING (user_id = auth.uid());

-- 9. PRICE_HISTORY policies
CREATE POLICY "Users access own price history" ON public.price_history FOR ALL USING (
  subscription_id IN (SELECT id FROM public.subscriptions WHERE user_id = auth.uid())
);

-- 10. BANK_IMPORT_TRANSACTIONS policies
CREATE POLICY "Users access own bank transactions" ON public.bank_import_transactions FOR ALL USING (user_id = auth.uid());

-- 11. EMAIL_SCAN_MATCHES policies
CREATE POLICY "Users access own email matches" ON public.email_scan_matches FOR ALL USING (user_id = auth.uid());


-- =========================================================================
-- TRIGGERS & AUTOMATION
-- =========================================================================

-- Trigger to auto-create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to auto-log price changes
CREATE OR REPLACE FUNCTION public.handle_subscription_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.cost <> NEW.cost THEN
    INSERT INTO public.price_history (subscription_id, old_cost, new_cost, currency, notes)
    VALUES (NEW.id, OLD.cost, NEW.cost, NEW.currency, 'Price updated in app');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_subscription_price_updated
  AFTER UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_subscription_price_change();
