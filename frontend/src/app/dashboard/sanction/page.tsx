'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Loan } from '@/types';

export default function SanctionModule() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; loanId: string }>({ open: false, loanId: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const data = await api.getLoans('applied');
      setLoans(data.loans);
    } catch {
      console.error('Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  const handleSanction = async (id: string) => {
    setActionLoading(id);
    try {
      await api.sanctionLoan(id);
      setMessage({ type: 'success', text: 'Loan sanctioned successfully.' });
      fetchLoans();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to sanction loan.' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setActionLoading(rejectModal.loanId);
    try {
      await api.rejectLoan(rejectModal.loanId, rejectReason);
      setMessage({ type: 'success', text: 'Loan rejected.' });
      setRejectModal({ open: false, loanId: '' });
      setRejectReason('');
      fetchLoans();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to reject loan.' });
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
        <h2 className="text-xl font-bold text-white">Sanction — Review Applications</h2>
        <p className="text-surface-500 text-sm mt-1">Approve or reject applied loan requests</p>
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
          <div className="text-3xl mb-3">✅</div>
          <p className="text-surface-500">No pending loan applications to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => {
            const borrower = loan.borrower as any;
            return (
              <div
                key={loan._id}
                className="glass-panel-hover rounded-2xl p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">₹{loan.loanAmount.toLocaleString()}</h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                      <span className="text-surface-400">Borrower:</span>
                      <span className="text-white">{borrower?.fullName || borrower?.email || 'N/A'}</span>
                      <span className="text-surface-400">PAN:</span>
                      <span className="text-white">{borrower?.pan || 'N/A'}</span>
                      <span className="text-surface-400">Salary:</span>
                      <span className="text-white">₹{borrower?.monthlySalary?.toLocaleString() || 'N/A'}</span>
                      <span className="text-surface-400">Employment:</span>
                      <span className="text-white capitalize">{borrower?.employmentMode || 'N/A'}</span>
                      <span className="text-surface-400">Tenure:</span>
                      <span className="text-white">{loan.tenure} days</span>
                      <span className="text-surface-400">Interest:</span>
                      <span className="text-white">₹{loan.simpleInterest.toFixed(2)}</span>
                      <span className="text-surface-400">Total Repayment:</span>
                      <span className="text-primary-400 font-medium">₹{loan.totalRepayment.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSanction(loan._id)}
                      disabled={actionLoading === loan._id}
                      className="px-5 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 text-sm font-semibold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {actionLoading === loan._id ? '...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => setRejectModal({ open: true, loanId: loan._id })}
                      disabled={actionLoading === loan._id}
                      className="px-5 py-2 bg-danger-500/15 hover:bg-danger-500/25 text-danger-400 border border-danger-500/20 text-sm font-semibold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="glass-panel rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-4">Reject Loan</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={3}
              className="w-full px-4 py-3 glass-input resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setRejectModal({ open: false, loanId: '' });
                  setRejectReason('');
                }}
                className="flex-1 py-2 bg-surface-800 hover:bg-surface-700 text-surface-300 rounded-lg transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="flex-1 py-2 bg-danger-600 hover:bg-danger-500 text-white rounded-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
