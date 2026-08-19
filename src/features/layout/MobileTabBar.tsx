import React from 'react';
import { LayoutDashboard, CreditCard, ShieldX, FileSpreadsheet, MessageSquareQuote } from 'lucide-react';

export type TabType = 'dashboard' | 'subscriptions' | 'cancel_helper' | 'bank_import' | 'scripts';

interface MobileTabBarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  urgentCount: number;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeTab,
  setActiveTab,
  urgentCount
}) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subscriptions' as TabType, label: 'Tracker', icon: CreditCard },
    { id: 'cancel_helper' as TabType, label: 'Cancel Guide', icon: ShieldX, badge: urgentCount > 0 ? urgentCount : undefined },
    { id: 'bank_import' as TabType, label: 'Bank CSV', icon: FileSpreadsheet },
    { id: 'scripts' as TabType, label: 'Scripts', icon: MessageSquareQuote }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe">
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-all ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {t.badge && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-rose-500 text-white font-black text-[9px] rounded-full animate-pulse">
                    {t.badge}
                  </span>
                )}
              </div>
              <span>{t.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-8 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
