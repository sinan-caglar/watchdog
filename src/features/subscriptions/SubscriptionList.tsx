import React, { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import type { Subscription } from '../../types';
import { SubscriptionCard } from './SubscriptionCard';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  currency: string;
  onAddClick: () => void;
  onCancelClick: (sub: Subscription) => void;
  onEditClick: (sub: Subscription) => void;
  onDeleteClick: (subId: string) => void;
}

export const SubscriptionList: React.FC<SubscriptionListProps> = ({
  subscriptions,
  currency,
  onAddClick,
  onCancelClick,
  onEditClick,
  onDeleteClick
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'next_charge' | 'cost' | 'name'>('next_charge');

  // Filtering Logic
  const filtered = subscriptions.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(search.toLowerCase()) || (sub.notes && sub.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || sub.category === categoryFilter;
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'trial' ? (sub.type === 'trial' || sub.status === 'trial') :
      sub.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sorting Logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'next_charge') {
      return new Date(a.next_charge_date).getTime() - new Date(b.next_charge_date).getTime();
    } else if (sortBy === 'cost') {
      return b.cost - a.cost;
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  return (
    <div className="space-y-4">
      
      {/* Header Controls & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search subscriptions or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by Status"
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="trial">Trials Only</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by Category"
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none capitalize"
          >
            <option value="all">All Categories</option>
            <option value="streaming">Streaming</option>
            <option value="software">Software</option>
            <option value="fitness">Fitness</option>
            <option value="food">Food</option>
            <option value="news">News</option>
            <option value="gaming">Gaming</option>
            <option value="cloud">Cloud</option>
            <option value="other">Other</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            aria-label="Sort subscriptions"
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="next_charge">Sort by Date</option>
            <option value="cost">Sort by Cost</option>
            <option value="name">Sort by Name</option>
          </select>

          {/* Add Button */}
          <button
            onClick={onAddClick}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-1.5 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New</span>
          </button>
        </div>

      </div>

      {/* Subscription Grid */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map(sub => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              currency={currency}
              onCancelClick={onCancelClick}
              onEditClick={onEditClick}
              onDeleteClick={onDeleteClick}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            No Subscriptions Match Filters
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or status filters, or add a new subscription to track.
          </p>
          <button
            onClick={onAddClick}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subscription</span>
          </button>
        </div>
      )}

    </div>
  );
};
