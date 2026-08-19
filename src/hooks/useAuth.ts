import { useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { authService } from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(() => authService.loadUser());
  const [currency, setCurrencyState] = useState<string>(() => authService.loadCurrency());

  useEffect(() => {
    authService.saveUser(user);
  }, [user]);

  useEffect(() => {
    authService.saveCurrency(currency);
  }, [currency]);

  const login = (email: string) => {
    const newUser: UserProfile = {
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
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const purgeAccount = () => {
    authService.purgeAccount();
    setUser(null);
  };

  const setCurrency = (c: string) => {
    setCurrencyState(c);
  };

  return {
    user,
    currency,
    setCurrency,
    login,
    logout,
    purgeAccount
  };
}
