import React from 'react';
import { ShieldAlert, Sun, Moon, Bell, User, Sparkles } from 'lucide-react';
import type { UserProfile, NotificationItem } from '../../types';
import { CURRENCY_SYMBOLS } from '../../lib/utils';

interface HeaderProps {
  user: UserProfile | null;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  notifications: NotificationItem[];
  currency: string;
  setCurrency: (c: string) => void;
  onOpenAuth: () => void;
  onOpenNotifications: () => void;
  savedMoney: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  darkMode,
  setDarkMode,
  notifications,
  currency,
  setCurrency,
  onOpenAuth,
  onOpenNotifications,
  savedMoney
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold text-xl">
            <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-teal-900 to-emerald-700 dark:from-white dark:via-emerald-300 dark:to-teal-400 bg-clip-text text-transparent">
                Watchdog
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none">
              Trial & Subscription Defender
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Currency Selector */}
          <div className="relative">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              aria-label="Select Preferred Currency"
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {Object.keys(CURRENCY_SYMBOLS).map(curr => (
                <option key={curr} value={curr}>
                  {curr} ({CURRENCY_SYMBOLS[curr]})
                </option>
              ))}
            </select>
          </div>

          {/* Money Saved Quick Badge */}
          {savedMoney > 0 && (
            <div className="hidden md:flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>Saved {CURRENCY_SYMBOLS[currency] || '$'}{savedMoney.toFixed(0)}</span>
            </div>
          )}

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            aria-label="View notifications"
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle light or dark theme"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          {/* User Account Button */}
          <button
            onClick={onOpenAuth}
            aria-label="Open Account Settings"
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-medium text-xs hover:opacity-90 transition-opacity shadow-sm"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">
              {user ? user.full_name.split(' ')[0] : 'Sign In'}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
