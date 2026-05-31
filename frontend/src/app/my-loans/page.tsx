'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Loan } from '@/types';

const statusColors: Record<string, string> = {
  applied: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  sanctioned: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
  disbursed: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  closed: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
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
    <div className="min-h-screen bg-surface-950">
      {/* Header */}
      <header className="bg-surface-900/80 backdrop-blur-xl border-b border-surface-700/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-white">CreditSea</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/apply')}
              className="text-sm text-surface-400 hover:text-white transition-colors cursor-pointer"
            >
              Apply for Loan
            </button>
            <button
              onClick={logout}
              className="text-sm text-surface-400 hover:text-danger-500 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">My Loans</h1>

        {loans.length === 0 ? (
          <div className="bg-surface-900/50 backdrop-blur-xl border border-surface-700/50 rounded-2xl p-12 text-center">
            <svg className="w-16 h-16 text-surface-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-surface-400 mb-4">You haven&apos;t applied for any loans yet.</p>
            <button
              onClick={() => router.push('/apply')}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-all cursor-pointer"
            >
              Apply Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => (
              <div
                key={loan._id}
                className="bg-surface-900/50 backdrop-blur-xl border border-surface-700/50 rounded-xl p-6 hover:border-surface-600/50 transition-all"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-white">
                        ₹{loan.loanAmount.toLocaleString()}
                      </h3>
                      <span className={`px-3 py-0.5 text-xs font-medium rounded-full border ${statusColors[loan.status]}`}>
                        {loan.status.toUpperCase()}
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
                    <div className="w-full bg-surface-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary-600 to-primary-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (loan.totalPaid / loan.totalRepayment) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-surface-500 mt-1">
                      {((loan.totalPaid / loan.totalRepayment) * 100).toFixed(1)}% paid
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
