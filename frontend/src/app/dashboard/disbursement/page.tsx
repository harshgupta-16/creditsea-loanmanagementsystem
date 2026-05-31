'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Loan } from '@/types';

export default function DisbursementModule() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const data = await api.getLoans('sanctioned');
      setLoans(data.loans);
    } catch {
      console.error('Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  const handleDisburse = async (id: string) => {
    setActionLoading(id);
    try {
      await api.disburseLoan(id);
      setMessage({ type: 'success', text: 'Loan disbursed successfully. Funds released.' });
      fetchLoans();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to disburse loan.' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
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
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Disbursement — Release Funds</h2>
        <p className="text-surface-400 text-sm mt-1">Disburse sanctioned loans to borrowers</p>
      </div>

      {message.text && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${
          message.type === 'success'
            ? 'bg-success-500/10 border border-success-500/30 text-success-500'
            : 'bg-danger-500/10 border border-danger-500/30 text-danger-500'
        }`}>
          {message.text}
        </div>
      )}

      {loans.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <div className="text-3xl mb-3">💸</div>
          <p className="text-surface-500">No sanctioned loans pending disbursement.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-[10px] font-bold text-surface-500 uppercase tracking-wider px-6 py-4">Borrower</th>
                  <th className="text-left text-[10px] font-bold text-surface-500 uppercase tracking-wider px-6 py-4">Amount</th>
                  <th className="text-left text-[10px] font-bold text-surface-500 uppercase tracking-wider px-6 py-4">Tenure</th>
                  <th className="text-left text-[10px] font-bold text-surface-500 uppercase tracking-wider px-6 py-4">Total Repayment</th>
                  <th className="text-left text-[10px] font-bold text-surface-500 uppercase tracking-wider px-6 py-4">Sanctioned By</th>
                  <th className="text-left text-[10px] font-bold text-surface-500 uppercase tracking-wider px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => {
                  const borrower = loan.borrower as any;
                  const sanctionedBy = loan.sanctionedBy as any;
                  return (
                    <tr key={loan._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-white">{borrower?.fullName || 'N/A'}</p>
                          <p className="text-[10px] text-surface-500">{borrower?.email || ''}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-medium">₹{loan.loanAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-surface-400 font-mono">{loan.tenure} days</td>
                      <td className="px-6 py-4 text-sm text-primary-400 font-medium">₹{loan.totalRepayment.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-surface-400">{sanctionedBy?.fullName || sanctionedBy?.email || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDisburse(loan._id)}
                          disabled={actionLoading === loan._id}
                          className="px-4 py-2 bg-purple-500/15 hover:bg-purple-500/25 text-purple-400 border border-purple-500/20 text-xs font-semibold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {actionLoading === loan._id ? 'Processing...' : 'Disburse'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
