'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Loan } from '@/types';

const statusConfig: Record<string, { bg: string; text: string; icon: string }> = {
  applied: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400', icon: '📝' },
  sanctioned: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', icon: '✅' },
  rejected: { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-400', icon: '❌' },
  disbursed: { bg: 'bg-purple-500/10 border-purple-500/20', text: 'text-purple-400', icon: '💰' },
  closed: { bg: 'bg-gray-500/10 border-gray-500/20', text: 'text-gray-400', icon: '🏁' },
};

export default function MyLoansPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'borrower') {
      router.push('/dashboard');
      return;
    }
    if (user) {
      fetchLoans();
    }
  }, [user, loading, router]);

  const fetchLoans = async () => {
    try {
      const data = await api.getMyLoans();
      setLoans(data.loans);
    } catch {
      console.error('Failed to fetch loans');
    } finally {
      setFetching(false);
    }
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 relative overflow-x-hidden mesh-bg">
      <div className="absolute inset-0 dot-pattern pointer-events-none opacity-40" />

      {/* Header */}
      <header className="bg-surface-950/80 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-accent-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-white text-sm">CreditSea</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/apply')}
              className="text-xs text-surface-400 hover:text-white transition-colors cursor-pointer font-medium"
            >
              Apply for Loan
            </button>
            <button
              onClick={logout}
              className="text-xs text-surface-400 hover:text-danger-500 transition-colors cursor-pointer font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <h1 className="text-2xl font-bold text-white mb-6">My Loans</h1>

        {loans.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">📄</div>
            <p className="text-surface-400 mb-4">You haven&apos;t applied for any loans yet.</p>
            <button
              onClick={() => router.push('/apply')}
              className="px-6 py-3 glass-button rounded-xl"
            >
              Apply Now →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => {
              const config = statusConfig[loan.status] || statusConfig.applied;
              return (
                <div
                  key={loan._id}
                  className="glass-panel-hover rounded-2xl p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-white">
                          ₹{loan.loanAmount.toLocaleString()}
                        </h3>
                        <span className={`px-3 py-0.5 text-xs font-semibold rounded-full border ${config.bg} ${config.text}`}>
                          {config.icon} {loan.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-surface-400">
                        <span>Tenure: {loan.tenure} days</span>
                        <span>Interest: ₹{loan.simpleInterest.toFixed(2)}</span>
                        <span>Total: ₹{loan.totalRepayment.toFixed(2)}</span>
                      </div>
                      {loan.status === 'disbursed' && (
                        <div className="text-sm">
                          <span className="text-surface-400">Paid: </span>
                          <span className="text-success-500 font-medium">₹{loan.totalPaid.toFixed(2)}</span>
                          <span className="text-surface-500"> / ₹{loan.totalRepayment.toFixed(2)}</span>
                        </div>
                      )}
                      {loan.rejectionReason && (
                        <p className="text-sm text-danger-500">Reason: {loan.rejectionReason}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-surface-500">
                      <p>Applied on</p>
                      <p className="text-surface-300">{new Date(loan.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Progress bar for disbursed loans */}
                  {loan.status === 'disbursed' && loan.totalRepayment > 0 && (
                    <div className="mt-4">
                      <div className="w-full bg-surface-800/50 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (loan.totalPaid / loan.totalRepayment) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-surface-500 mt-1">
                        {((loan.totalPaid / loan.totalRepayment) * 100).toFixed(1)}% paid
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
