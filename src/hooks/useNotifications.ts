import { useState, useEffect } from 'react';
import type { Subscription, NotificationItem } from '../types';
import { notificationService } from '../services/notificationService';

export function useNotifications(subscriptions: Subscription[], currency: string, userId: string) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const generated = notificationService.generateAlerts(subscriptions, currency, userId);
    setNotifications(generated);
  }, [subscriptions, currency, userId]);

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length
  };
}
