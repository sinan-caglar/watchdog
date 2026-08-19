import React, { useState } from 'react';
import { X, Download, Trash2, Mail, Lock } from 'lucide-react';
import type { UserProfile, Subscription } from '../../types';
import { CURRENCY_SYMBOLS } from '../../lib/utils';

interface AuthModalProps {
  user: UserProfile | null;
  subscriptions: Subscription[];
  currency: string;
  setCurrency: (c: string) => void;
  onClose: () => void;
  onLogin: (email: string) => void;
  onLogout: () => void;
  onPurgeAccount: () => void;
  onExportData: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  user,
  currency,
  setCurrency,
  onClose,
  onLogin,
  onLogout,
  onPurgeAccount,
  onExportData
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPurge, setConfirmPurge] = useState(false);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onLogin(email);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            {user ? 'Account Settings' : isSignUp ? 'Create Watchdog Account' : 'Sign In'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close account settings modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          
          {user ? (
            /* Logged In Account Settings */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-bold text-lg flex items-center justify-center">
                  {user.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {user.full_name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Preferred Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {Object.keys(CURRENCY_SYMBOLS).map(c => (
                    <option key={c} value={c}>{c} ({CURRENCY_SYMBOLS[c]})</option>
                  ))}
                </select>
              </div>

              {/* Data Export Button */}
              <button
                onClick={onExportData}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Subscriptions Data (JSON)</span>
              </button>

              {/* Sign Out */}
              <button
                onClick={() => { onLogout(); onClose(); }}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Sign Out
              </button>

              {/* Full Account Purge */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                {!confirmPurge ? (
                  <button
                    onClick={() => setConfirmPurge(true)}
                    className="w-full py-2 text-rose-600 dark:text-rose-400 hover:underline font-bold text-xs flex items-center justify-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Account & Purge Data</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 space-y-2 text-center">
                    <p className="text-xs font-bold text-rose-800 dark:text-rose-200">
                      Permanently delete account and erase all subscriptions?
                    </p>
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => setConfirmPurge(false)}
                        className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => { onPurgeAccount(); onClose(); }}
                        className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold"
                      >
                        Yes, Delete All
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* Sign In / Sign Up Form */
            <form onSubmit={handleAuthSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 transition-all"
              >
                {isSignUp ? 'Create Free Account' : 'Sign In to Watchdog'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up Free'}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
