import type { UserProfile, Subscription } from '../types';
import { INITIAL_USER } from '../lib/mockData';

const USER_KEY = 'watchdog_user';
const CURRENCY_KEY = 'watchdog_currency';

export const authService = {
  loadUser(): UserProfile | null {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : INITIAL_USER;
  },

  saveUser(user: UserProfile | null): void {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  },

  loadCurrency(): string {
    return localStorage.getItem(CURRENCY_KEY) || 'USD';
  },

  saveCurrency(currency: string): void {
    localStorage.setItem(CURRENCY_KEY, currency);
  },

  exportData(subscriptions: Subscription[]): void {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(subscriptions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `watchdog_subscriptions_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  purgeAccount(): void {
    localStorage.clear();
  }
};
