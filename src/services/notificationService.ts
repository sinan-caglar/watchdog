import type { Subscription, NotificationItem } from '../types';
import { getDaysUntil, formatCurrency } from '../lib/utils';

export const notificationService = {
  generateAlerts(subscriptions: Subscription[], currency: string, userId: string): NotificationItem[] {
    const urgentItems = subscriptions.filter(s => s.status !== 'cancelled' && getDaysUntil(s.next_charge_date) <= 3);
    
    return urgentItems.map(item => ({
      id: `notif-${item.id}`,
      user_id: userId,
      subscription_id: item.id,
      title: `Urgent: ${item.name} Charges Soon!`,
      body: `${item.name} charges ${formatCurrency(item.cost, item.currency || currency)} on ${item.next_charge_date}`,
      type: item.type === 'trial' ? 'trial_warning' : 'renewal_alert',
      read: false,
      sent_at: new Date().toISOString()
    }));
  }
};
