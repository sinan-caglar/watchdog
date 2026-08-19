import { useState, useEffect } from 'react';
import type { Subscription } from '../types';
import { subscriptionService } from '../services/subscriptionService';

export function useSubscriptions(userId: string, currency: string) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => 
    subscriptionService.loadSubscriptions()
  );
  
  const [savedMoney, setSavedMoney] = useState<number>(() => 
    subscriptionService.loadSavedMoney()
  );

  useEffect(() => {
    subscriptionService.saveSubscriptions(subscriptions);
  }, [subscriptions]);

  useEffect(() => {
    subscriptionService.saveSavedMoney(savedMoney);
  }, [savedMoney]);

  const addSubscription = (data: Partial<Subscription>) => {
    const newSub = subscriptionService.createSubscription(data, userId, currency);
    setSubscriptions(prev => [newSub, ...prev]);
  };

  const updateSubscription = (id: string, data: Partial<Subscription>) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...data, updated_at: new Date().toISOString() } : s));
  };

  const deleteSubscription = (id: string) => {
    if (window.confirm('Are you sure you want to remove this subscription from tracking?')) {
      setSubscriptions(prev => prev.filter(s => s.id !== id));
    }
  };

  const cancelSubscription = (
    id: string, 
    savedAmount: number, 
    proofData?: { refNumber?: string; confirmEmail?: string; proofUrl?: string }
  ) => {
    setSubscriptions(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          saved_amount_estimate: savedAmount,
          cancellation_ref_number: proofData?.refNumber || s.cancellation_ref_number,
          cancellation_confirm_email: proofData?.confirmEmail || s.cancellation_confirm_email,
          cancellation_proof_url: proofData?.proofUrl || s.cancellation_proof_url
        };
      }
      return s;
    }));
    setSavedMoney(prev => prev + savedAmount);
  };

  const keepPriceHike = (id: string) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, price_increased: false } : s));
  };

  const importBankTransactions = (toAdd: Partial<Subscription>[]) => {
    const newItems: Subscription[] = toAdd.map((item, idx) => ({
      id: `sub-bank-${Date.now()}-${idx}`,
      user_id: userId,
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

    setSubscriptions(prev => [...newItems, ...prev]);
  };

  return {
    subscriptions,
    savedMoney,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    cancelSubscription,
    keepPriceHike,
    importBankTransactions,
    setSubscriptions,
    setSavedMoney
  };
}
