import React from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import type { Subscription } from '../../types';
import { calculateMonthlySpend, formatCurrency } from '../../lib/utils';

interface SpendingChartsProps {
  subscriptions: Subscription[];
  currency: string;
  darkMode: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  streaming: '#8b5cf6', // Purple
  software: '#3b82f6',  // Blue
  fitness: '#10b981',   // Emerald
  food: '#f59e0b',      // Amber
  news: '#ec4899',      // Pink
  gaming: '#6366f1',    // Indigo
  cloud: '#06b6d4',     // Cyan
  other: '#64748b'      // Slate
};

export const SpendingCharts: React.FC<SpendingChartsProps> = ({
  subscriptions,
  currency,
  darkMode
}) => {
  const activeSubs = subscriptions.filter(s => s.status === 'active' || s.status === 'trial');

  // Category Pie Data
  const categoryMap: Record<string, number> = {};
  activeSubs.forEach(s => {
    const monthly = calculateMonthlySpend(s.cost, s.billing_cycle);
    categoryMap[s.category] = (categoryMap[s.category] || 0) + monthly;
  });

  const pieData = Object.keys(categoryMap).map(cat => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: parseFloat(categoryMap[cat].toFixed(2)),
    color: CATEGORY_COLORS[cat] || CATEGORY_COLORS.other
  })).filter(d => d.value > 0);

  // Monthly Billing Timeline Data (Next 6 Months Projection)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIdx = new Date().getMonth();
  
  const barData = Array.from({ length: 6 }).map((_, idx) => {
    const mIdx = (currentMonthIdx + idx) % 12;
    const mName = monthNames[mIdx];
    
    // Estimate total spend for this month
    const total = activeSubs.reduce((acc, sub) => {
      return acc + calculateMonthlySpend(sub.cost, sub.billing_cycle);
    }, 0);

    return {
      month: mName,
      Spend: parseFloat(total.toFixed(2))
    };
  });

  const textColor = darkMode ? '#94a3b8' : '#64748b';
  const gridColor = darkMode ? '#1f2937' : '#e2e8f0';

  if (activeSubs.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-center text-slate-500">
        No active subscriptions to project spending charts. Add your first subscription to view analytics!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      
      {/* Category Breakdown Donut Chart */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
          Monthly Spend by Category
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Distribution of recurring expenses across categories
        </p>

        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => [formatCurrency(Number(val) || 0, currency), 'Monthly']}
                contentStyle={{
                  backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                  borderColor: darkMode ? '#334155' : '#e2e8f0',
                  borderRadius: '12px',
                  color: darkMode ? '#f8fafc' : '#0f172a',
                  fontWeight: 'bold',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          {pieData.map(item => (
            <div key={item.name} className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.name}: {formatCurrency(item.value, currency)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Projection Bar Chart */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
          6-Month Projected Spend Trend
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Estimated upcoming recurring obligations
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" stroke={textColor} fontSize={12} tickLine={false} />
              <YAxis stroke={textColor} fontSize={12} tickLine={false} />
              <Tooltip
                formatter={(val: any) => [formatCurrency(Number(val) || 0, currency), 'Estimated Spend']}
                contentStyle={{
                  backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                  borderColor: darkMode ? '#334155' : '#e2e8f0',
                  borderRadius: '12px',
                  color: darkMode ? '#f8fafc' : '#0f172a',
                  fontWeight: 'bold'
                }}
              />
              <Bar dataKey="Spend" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
