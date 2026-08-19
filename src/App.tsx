import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { MobileTabBar, type TabType } from './components/layout/MobileTabBar';
import { UrgentAlertsBanner } from './components/dashboard/UrgentAlertsBanner';
import { SummaryCards } from './components/dashboard/SummaryCards';
import { SpendingCharts } from './components/dashboard/SpendingCharts';
import { SubscriptionList } from './components/subscriptions/SubscriptionList';
import { SubscriptionFormModal } from './components/subscriptions/SubscriptionFormModal';
import { CancellationModal } from './components/subscriptions/CancellationModal';
import { BankCsvImportModal } from './components/tools/BankCsvImportModal';
import { NegotiationScriptsModal } from './components/tools/NegotiationScriptsModal';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingFlow } from './components/auth/OnboardingFlow';
import { INITIAL_USER, INITIAL_SUBSCRIPTIONS } from './lib/mockData';
import type { Subscription, UserProfile, NotificationItem } from './types';
import { getDaysUntil, formatCurrency } from './lib/utils';
import { Plus, FileSpreadsheet, MessageSquareQuote } from 'lucide-react';

export function App() {
  // Theme State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('watchdog_theme') === 'dark' || true; // Default sleek dark mode
  });

  // User & Currency State
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('watchdog_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem('watchdog_currency') || 'USD';
  });

  // Subscriptions State
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem('watchdog_subscriptions');
    return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTIONS;
  });

  // Saved Money Counter
  const [savedMoney, setSavedMoney] = useState<number>(() => {
    const saved = localStorage.getItem('watchdog_saved_money');
    if (saved) return parseFloat(saved);
    // Initial sum from cancelled mock items
    return INITIAL_SUBSCRIPTIONS.filter(s => s.status === 'cancelled')
      .reduce((acc, s) => acc + (s.saved_amount_estimate || s.cost * 12), 0);
  });

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showScriptsModal, setShowScriptsModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('watchdog_onboarded') !== 'true' && false;
  });

  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [cancellingSub, setCancellingSub] = useState<Subscription | null>(null);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('watchdog_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('watchdog_theme', 'light');
    }
  }, [darkMode]);

  // Sync persistence
  useEffect(() => {
    localStorage.setItem('watchdog_subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('watchdog_saved_money', savedMoney.toString());
  }, [savedMoney]);

  useEffect(() => {
    localStorage.setItem('watchdog_currency', currency);
  }, [currency]);

  // Generate automated reminders log
  useEffect(() => {
    const urgentItems = subscriptions.filter(s => s.status !== 'cancelled' && getDaysUntil(s.next_charge_date) <= 3);
    const logs: NotificationItem[] = urgentItems.map(item => ({
      id: `notif-${item.id}`,
      user_id: user?.id || 'usr-demo-101',
      subscription_id: item.id,
      title: `Urgent: ${item.name} Charges Soon!`,
      body: `${item.name} charges ${formatCurrency(item.cost, item.currency || currency)} on ${item.next_charge_date}`,
      type: item.type === 'trial' ? 'trial_warning' : 'renewal_alert',
      read: false,
      sent_at: new Date().toISOString()
    }));
    setNotifications(logs);
  }, [subscriptions, currency, user]);

  // Urgent Count for Tab Badge
  const urgentTrialsCount = subscriptions.filter(
    s => (s.type === 'trial' || s.status === 'trial') && s.status !== 'cancelled' && getDaysUntil(s.next_charge_date) <= 3
  ).length;

  // Handlers
  const handleSaveSubscription = (data: Partial<Subscription>) => {
    if (editingSub) {
      setSubscriptions(subscriptions.map(s => s.id === editingSub.id ? { ...s, ...data, updated_at: new Date().toISOString() } : s));
    } else {
      const newSub: Subscription = {
        id: `sub-${Date.now()}`,
        user_id: user?.id || 'usr-demo-101',
        name: data.name || 'Untitled Subscription',
        category: data.category || 'other',
        cost: data.cost || 0,
        currency: data.currency || currency,
        billing_cycle: data.billing_cycle || 'monthly',
        type: data.type || 'paid',
        status: data.status || 'active',
        start_date: data.start_date || new Date().toISOString().split('T')[0],
        next_charge_date: data.next_charge_date || new Date().toISOString().split('T')[0],
        trial_end_date: data.trial_end_date,
        payment_method_label: data.payment_method_label,
        cancellation_url: data.cancellation_url,
        cancellation_steps: data.cancellation_steps,
        cancellation_difficulty: data.cancellation_difficulty,
        notes: data.notes,
        saved_amount_estimate: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setSubscriptions([newSub, ...subscriptions]);
    }
    setShowFormModal(false);
    setEditingSub(null);
  };

  const handleDeleteSubscription = (subId: string) => {
    if (window.confirm('Are you sure you want to remove this subscription from tracking?')) {
      setSubscriptions(subscriptions.filter(s => s.id !== subId));
    }
  };

  const handleConfirmCancelled = (subId: string, savedAmount: number) => {
    setSubscriptions(subscriptions.map(s => {
      if (s.id === subId) {
        return {
          ...s,
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          saved_amount_estimate: savedAmount
        };
      }
      return s;
    }));
    setSavedMoney(prev => prev + savedAmount);
  };

  const handleConfirmBankMatches = (toAdd: Partial<Subscription>[]) => {
    const newItems: Subscription[] = toAdd.map((item, idx) => ({
      id: `sub-bank-${Date.now()}-${idx}`,
      user_id: user?.id || 'usr-demo-101',
      name: item.name || 'Bank Transaction',
      category: item.category || 'other',
      cost: item.cost || 9.99,
      currency: item.currency || currency,
      billing_cycle: 'monthly',
      type: 'paid',
      status: 'active',
      start_date: item.start_date || new Date().toISOString().split('T')[0],
      next_charge_date: item.next_charge_date || new Date().toISOString().split('T')[0],
      payment_method_label: 'Bank Import',
      cancellation_url: item.cancellation_url,
      cancellation_steps: item.cancellation_steps,
      cancellation_difficulty: item.cancellation_difficulty,
      saved_amount_estimate: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    setSubscriptions([...newItems, ...subscriptions]);
  };

  const handleOnboardingComplete = (initialSubs: Partial<Subscription>[]) => {
    localStorage.setItem('watchdog_onboarded', 'true');
    setShowOnboarding(false);
    if (initialSubs.length > 0) {
      handleConfirmBankMatches(initialSubs);
    }
  };

  const handlePurgeAccount = () => {
    localStorage.clear();
    setUser(null);
    setSubscriptions([]);
    setSavedMoney(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 font-sans antialiased pb-20 md:pb-8 transition-colors">
      
      {/* Top Navigation Bar */}
      <Header
        user={user}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        notifications={notifications}
        currency={currency}
        setCurrency={setCurrency}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenNotifications={() => setActiveTab('dashboard')}
        savedMoney={savedMoney}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Desktop Quick Tools Toolbar */}
        <div className="hidden md:flex items-center justify-between bg-white dark:bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Dashboard & Analytics
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all ${
                activeTab === 'subscriptions'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All Subscriptions ({subscriptions.length})
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowBankModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
              <span>Import Bank CSV</span>
            </button>
            <button
              onClick={() => setShowScriptsModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition-colors"
            >
              <MessageSquareQuote className="w-4 h-4 text-teal-500" />
              <span>Phone Scripts</span>
            </button>
            <button
              onClick={() => { setEditingSub(null); setShowFormModal(true); }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Subscription</span>
            </button>
          </div>
        </div>

        {/* Urgent Action Banner */}
        <UrgentAlertsBanner
          subscriptions={subscriptions}
          currency={currency}
          onCancelClick={(sub) => { setCancellingSub(sub); setShowCancelModal(true); }}
        />

        {/* Tab 1: Dashboard */}
        {(activeTab === 'dashboard' || activeTab === 'cancel_helper') && (
          <div className="space-y-6 animate-fade-in">
            <SummaryCards
              subscriptions={subscriptions}
              currency={currency}
              savedMoney={savedMoney}
            />

            <SpendingCharts
              subscriptions={subscriptions}
              currency={currency}
              darkMode={darkMode}
            />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Tracked Items Overview
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Showing your active free trials and subscriptions
                  </p>
                </div>
                <button
                  onClick={() => { setEditingSub(null); setShowFormModal(true); }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Track New</span>
                </button>
              </div>

              <SubscriptionList
                subscriptions={subscriptions}
                currency={currency}
                onAddClick={() => { setEditingSub(null); setShowFormModal(true); }}
                onCancelClick={(sub) => { setCancellingSub(sub); setShowCancelModal(true); }}
                onEditClick={(sub) => { setEditingSub(sub); setShowFormModal(true); }}
                onDeleteClick={handleDeleteSubscription}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Subscriptions Tracker Tab */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-4 animate-fade-in">
            <SubscriptionList
              subscriptions={subscriptions}
              currency={currency}
              onAddClick={() => { setEditingSub(null); setShowFormModal(true); }}
              onCancelClick={(sub) => { setCancellingSub(sub); setShowCancelModal(true); }}
              onEditClick={(sub) => { setEditingSub(sub); setShowFormModal(true); }}
              onDeleteClick={handleDeleteSubscription}
            />
          </div>
        )}

        {/* Mobile Tab Fallback Views */}
        {activeTab === 'bank_import' && (
          <div className="py-6">
            <BankCsvImportModal
              currency={currency}
              onClose={() => setActiveTab('dashboard')}
              onConfirmMatches={handleConfirmBankMatches}
            />
          </div>
        )}

        {activeTab === 'scripts' && (
          <div className="py-6">
            <NegotiationScriptsModal
              onClose={() => setActiveTab('dashboard')}
            />
          </div>
        )}

      </main>

      {/* Mobile Tab Bar */}
      <MobileTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        urgentCount={urgentTrialsCount}
      />

      {/* Modals */}
      {showFormModal && (
        <SubscriptionFormModal
          initialData={editingSub}
          currency={currency}
          onClose={() => { setShowFormModal(false); setEditingSub(null); }}
          onSave={handleSaveSubscription}
        />
      )}

      {showCancelModal && cancellingSub && (
        <CancellationModal
          subscription={cancellingSub}
          currency={currency}
          onClose={() => { setShowCancelModal(false); setCancellingSub(null); }}
          onConfirmCancelled={handleConfirmCancelled}
        />
      )}

      {showBankModal && (
        <BankCsvImportModal
          currency={currency}
          onClose={() => setShowBankModal(false)}
          onConfirmMatches={handleConfirmBankMatches}
        />
      )}

      {showScriptsModal && (
        <NegotiationScriptsModal
          onClose={() => setShowScriptsModal(false)}
        />
      )}

      {showAuthModal && (
        <AuthModal
          user={user}
          subscriptions={subscriptions}
          currency={currency}
          setCurrency={setCurrency}
          onClose={() => setShowAuthModal(false)}
          onLogin={(email) => {
            setUser({
              id: `usr-${Date.now()}`,
              email,
              full_name: email.split('@')[0],
              currency,
              notification_preferences: {
                email_enabled: true,
                push_enabled: true,
                default_trial_reminder_days: [3, 1, 0],
                default_paid_reminder_days: [3]
              },
              onboarding_completed: true,
              created_at: new Date().toISOString()
            });
          }}
          onLogout={() => setUser(null)}
          onPurgeAccount={handlePurgeAccount}
        />
      )}

      {showOnboarding && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
        />
      )}

    </div>
  );
}
export default App;
