import React, { useState } from 'react';
import type { UserProfile, Subscription, NotificationItem } from '../types';
import { Header } from '../features/layout/Header';
import { MobileTabBar, type TabType } from '../features/layout/MobileTabBar';
import { UrgentAlertsBanner } from '../features/notifications/UrgentAlertsBanner';
import { PriceHikeAlertBanner } from '../features/notifications/PriceHikeAlertBanner';
import { SummaryCards } from '../features/dashboard/SummaryCards';
import { Upcoming30DaysCard } from '../features/dashboard/Upcoming30DaysCard';
import { RenewalCalendar } from '../features/dashboard/RenewalCalendar';
import { DuplicateAlertsBanner } from '../features/dashboard/DuplicateAlertsBanner';
import { SpendingCharts } from '../features/dashboard/SpendingCharts';
import { SubscriptionList } from '../features/subscriptions/SubscriptionList';
import { SubscriptionFormModal } from '../features/subscriptions/SubscriptionFormModal';
import { CancellationModal } from '../features/cancellation/CancellationModal';
import { BankCsvImportModal } from '../features/bank-import/BankCsvImportModal';
import { NegotiationScriptsModal } from '../features/scripts/NegotiationScriptsModal';
import { AuthModal } from '../features/auth/AuthModal';
import { OnboardingFlow } from '../features/auth/OnboardingFlow';
import { subscriptionService } from '../services/subscriptionService';
import { getDaysUntil } from '../lib/utils';
import { Plus, FileSpreadsheet, MessageSquareQuote } from 'lucide-react';

interface AppRoutesProps {
  user: UserProfile | null;
  currency: string;
  setCurrency: (c: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  subscriptions: Subscription[];
  savedMoney: number;
  notifications: NotificationItem[];
  onAddSubscription: (data: Partial<Subscription>) => void;
  onUpdateSubscription: (id: string, data: Partial<Subscription>) => void;
  onDeleteSubscription: (id: string) => void;
  onCancelSubscription: (id: string, savedAmount: number, proofData?: { refNumber?: string; confirmEmail?: string; proofUrl?: string }) => void;
  onKeepPriceHike: (id: string) => void;
  onImportBankTransactions: (toAdd: Partial<Subscription>[]) => void;
  onLogin: (email: string) => void;
  onLogout: () => void;
  onPurgeAccount: () => void;
  onExportData: () => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({
  user,
  currency,
  setCurrency,
  darkMode,
  setDarkMode,
  subscriptions,
  savedMoney,
  notifications,
  onAddSubscription,
  onUpdateSubscription,
  onDeleteSubscription,
  onCancelSubscription,
  onKeepPriceHike,
  onImportBankTransactions,
  onLogin,
  onLogout,
  onPurgeAccount,
  onExportData
}) => {
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

  const urgentTrialsCount = subscriptions.filter(
    s => (s.type === 'trial' || s.status === 'trial') && s.status !== 'cancelled' && getDaysUntil(s.next_charge_date) <= 3
  ).length;

  const duplicates = subscriptionService.detectDuplicates(subscriptions);

  const handleSaveForm = (data: Partial<Subscription>) => {
    if (editingSub) {
      onUpdateSubscription(editingSub.id, data);
    } else {
      onAddSubscription(data);
    }
    setShowFormModal(false);
    setEditingSub(null);
  };

  const handleOnboardingComplete = (initialSubs: Partial<Subscription>[]) => {
    localStorage.setItem('watchdog_onboarded', 'true');
    setShowOnboarding(false);
    if (initialSubs.length > 0) {
      onImportBankTransactions(initialSubs);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 font-sans antialiased pb-20 md:pb-8 transition-colors">
      
      {/* Header Navigation */}
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

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Desktop Quick Navigation Toolbar */}
        <div className="hidden md:flex items-center justify-between bg-white dark:bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              aria-label="Switch to Dashboard & Analytics tab"
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
              aria-label="Switch to All Subscriptions tab"
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
              aria-label="Open bank statement CSV import modal"
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
              <span>Import Bank CSV</span>
            </button>
            <button
              onClick={() => setShowScriptsModal(true)}
              aria-label="Open phone negotiation scripts library"
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition-colors"
            >
              <MessageSquareQuote className="w-4 h-4 text-teal-500" />
              <span>Phone Scripts</span>
            </button>
            <button
              onClick={() => { setEditingSub(null); setShowFormModal(true); }}
              aria-label="Open add new subscription modal"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Subscription</span>
            </button>
          </div>
        </div>

        {/* Price Increase Alert Banner */}
        <PriceHikeAlertBanner
          subscriptions={subscriptions}
          currency={currency}
          onCancelClick={(sub) => { setCancellingSub(sub); setShowCancelModal(true); }}
          onKeepClick={(sub) => onKeepPriceHike(sub.id)}
          onNegotiateClick={() => setShowScriptsModal(true)}
        />

        {/* Duplicate Subscription Alert Banner */}
        <DuplicateAlertsBanner
          duplicates={duplicates}
          onReviewDuplicate={(sub) => { setCancellingSub(sub); setShowCancelModal(true); }}
        />

        {/* Urgent Free Trial Alert Banner */}
        <UrgentAlertsBanner
          subscriptions={subscriptions}
          currency={currency}
          onCancelClick={(sub) => { setCancellingSub(sub); setShowCancelModal(true); }}
        />

        {/* Tab 1: Dashboard View */}
        {(activeTab === 'dashboard' || activeTab === 'cancel_helper') && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Upcoming 30 Days Hero Card */}
            <Upcoming30DaysCard
              subscriptions={subscriptions}
              currency={currency}
            />

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

            {/* Renewal & Trial Calendar Timeline View */}
            <RenewalCalendar
              subscriptions={subscriptions}
              currency={currency}
              onCancelClick={(sub) => { setCancellingSub(sub); setShowCancelModal(true); }}
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
                  aria-label="Track new subscription"
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
                onDeleteClick={onDeleteSubscription}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Tracker List View */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-4 animate-fade-in">
            <SubscriptionList
              subscriptions={subscriptions}
              currency={currency}
              onAddClick={() => { setEditingSub(null); setShowFormModal(true); }}
              onCancelClick={(sub) => { setCancellingSub(sub); setShowCancelModal(true); }}
              onEditClick={(sub) => { setEditingSub(sub); setShowFormModal(true); }}
              onDeleteClick={onDeleteSubscription}
            />
          </div>
        )}

        {/* Mobile Tab Views */}
        {activeTab === 'bank_import' && (
          <div className="py-6">
            <BankCsvImportModal
              currency={currency}
              onClose={() => setActiveTab('dashboard')}
              onConfirmMatches={onImportBankTransactions}
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

      {/* Mobile Bottom Tab Bar */}
      <MobileTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        urgentCount={urgentTrialsCount}
      />

      {/* Feature Modals */}
      {showFormModal && (
        <SubscriptionFormModal
          initialData={editingSub}
          currency={currency}
          onClose={() => { setShowFormModal(false); setEditingSub(null); }}
          onSave={handleSaveForm}
        />
      )}

      {showCancelModal && cancellingSub && (
        <CancellationModal
          subscription={cancellingSub}
          currency={currency}
          onClose={() => { setShowCancelModal(false); setCancellingSub(null); }}
          onConfirmCancelled={onCancelSubscription}
        />
      )}

      {showBankModal && (
        <BankCsvImportModal
          currency={currency}
          onClose={() => setShowBankModal(false)}
          onConfirmMatches={onImportBankTransactions}
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
          onLogin={onLogin}
          onLogout={onLogout}
          onPurgeAccount={onPurgeAccount}
          onExportData={onExportData}
        />
      )}

      {showOnboarding && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
        />
      )}

    </div>
  );
};
