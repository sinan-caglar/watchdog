import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useNotifications } from '../hooks/useNotifications';
import { authService } from '../services/authService';
import { AppRoutes } from './AppRoutes';

export function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('watchdog_theme') === 'dark' || true;
  });

  const { user, currency, setCurrency, login, logout, purgeAccount } = useAuth();
  
  const {
    subscriptions,
    savedMoney,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    cancelSubscription,
    keepPriceHike,
    importBankTransactions
  } = useSubscriptions(user?.id || 'usr-demo-101', currency);

  const { notifications } = useNotifications(subscriptions, currency, user?.id || 'usr-demo-101');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('watchdog_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('watchdog_theme', 'light');
    }
  }, [darkMode]);

  return (
    <AppRoutes
      user={user}
      currency={currency}
      setCurrency={setCurrency}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      subscriptions={subscriptions}
      savedMoney={savedMoney}
      notifications={notifications}
      onAddSubscription={addSubscription}
      onUpdateSubscription={updateSubscription}
      onDeleteSubscription={deleteSubscription}
      onCancelSubscription={cancelSubscription}
      onKeepPriceHike={keepPriceHike}
      onImportBankTransactions={importBankTransactions}
      onLogin={login}
      onLogout={logout}
      onPurgeAccount={purgeAccount}
      onExportData={() => authService.exportData(subscriptions)}
    />
  );
}

export default App;
