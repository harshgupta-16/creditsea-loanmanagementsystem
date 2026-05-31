'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Loan } from '@/types';

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

  const statCards = [
    { label: 'Total Loans', value: stats.total, color: 'from-primary-600 to-primary-400', textColor: 'text-primary-400' },
    { label: 'Applied', value: stats.applied, color: 'from-blue-600 to-blue-400', textColor: 'text-blue-400' },
    { label: 'Sanctioned', value: stats.sanctioned, color: 'from-emerald-600 to-emerald-400', textColor: 'text-emerald-400' },
    { label: 'Rejected', value: stats.rejected, color: 'from-red-600 to-red-400', textColor: 'text-red-400' },
    { label: 'Disbursed', value: stats.disbursed, color: 'from-purple-600 to-purple-400', textColor: 'text-purple-400' },
    { label: 'Closed', value: stats.closed, color: 'from-gray-600 to-gray-400', textColor: 'text-gray-400' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Welcome back, {user?.fullName || user?.email}</h2>
        <p className="text-surface-400 mt-1">Here&apos;s an overview of the loan pipeline.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-surface-900/50 backdrop-blur-xl border border-surface-700/50 rounded-xl p-6 hover:border-surface-600/50 transition-all"
          >
            <p className="text-sm text-surface-400 mb-2">{card.label}</p>
            <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
