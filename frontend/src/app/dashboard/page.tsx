'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Loan } from '@/types';

const STAT_CONFIG = [
  { key: 'total', label: 'Total Loans', icon: '📊', gradient: 'from-primary-500 to-accent-500' },
  { key: 'applied', label: 'Applied', icon: '📝', gradient: 'from-blue-500 to-blue-400' },
  { key: 'sanctioned', label: 'Sanctioned', icon: '✅', gradient: 'from-emerald-500 to-emerald-400' },
  { key: 'rejected', label: 'Rejected', icon: '❌', gradient: 'from-red-500 to-red-400' },
  { key: 'disbursed', label: 'Disbursed', icon: '💰', gradient: 'from-purple-500 to-purple-400' },
  { key: 'closed', label: 'Closed', icon: '🏁', gradient: 'from-gray-500 to-gray-400' },
];

export default function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    applied: 0,
    sanctioned: 0,
    rejected: 0,
    disbursed: 0,
    closed: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.getLoans();
      const loans: Loan[] = data.loans;
      const counts = {
        applied: loans.filter((l) => l.status === 'applied').length,
        sanctioned: loans.filter((l) => l.status === 'sanctioned').length,
        rejected: loans.filter((l) => l.status === 'rejected').length,
        disbursed: loans.filter((l) => l.status === 'disbursed').length,
        closed: loans.filter((l) => l.status === 'closed').length,
        total: loans.length,
      };
      setStats(counts);
    } catch {
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Welcome section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">
          Welcome back, <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">{user?.fullName || user?.email}</span>
        </h2>
        <p className="text-surface-500 mt-1 text-sm">Here&apos;s an overview of the loan pipeline.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STAT_CONFIG.map((card) => {
          const value = stats[card.key as keyof typeof stats];
          return (
            <div
              key={card.key}
              className="glass-panel-hover rounded-2xl p-5 group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg">{card.icon}</span>
                <div className={`w-8 h-1 rounded-full bg-gradient-to-r ${card.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{value}</p>
              <p className="text-xs text-surface-500 font-medium uppercase tracking-wider">{card.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
