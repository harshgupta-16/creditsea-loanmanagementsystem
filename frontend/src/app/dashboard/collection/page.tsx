'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Loan, Payment, PaymentSummary } from '@/types';

export default function CollectionModule() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Payment form
  const [utrNumber, setUtrNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const data = await api.getLoans('disbursed,closed');
      setLoans(data.loans);
    } catch {
      console.error('Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async (loanId: string) => {
    setPaymentsLoading(true);
    try {
      const data = await api.getPayments(loanId);
      setPayments(data.payments);
      setSummary(data.summary);
    } catch {
      console.error('Failed to fetch payments');
    } finally {
      setPaymentsLoading(false);
    }
  };

  const handleSelectLoan = (loanId: string) => {
    if (selectedLoan === loanId) {
      setSelectedLoan(null);
      return;
    }
    setSelectedLoan(loanId);
    fetchPayments(loanId);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await api.recordPayment(selectedLoan, {
        utrNumber,
        amount: Number(amount),
        date: paymentDate,
      });
      setMessage({ type: 'success', text: result.message });
      setUtrNumber('');
      setAmount('');
      fetchPayments(selectedLoan);
      fetchLoans();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to record payment.' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
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
        <h2 className="text-xl font-bold text-white">Collection — Record Payments</h2>
        <p className="text-surface-400 text-sm mt-1">Track borrower repayments and auto-close fully paid loans</p>
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
        <div className="bg-surface-900/50 border border-surface-700/50 rounded-xl p-12 text-center">
          <p className="text-surface-500">No disbursed or closed loans found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {loans.map((loan) => {
            const borrower = loan.borrower as any;
            const isSelected = selectedLoan === loan._id;
            const progress = loan.totalRepayment > 0 ? (loan.totalPaid / loan.totalRepayment) * 100 : 0;

            return (
              <div key={loan._id} className="bg-surface-900/50 backdrop-blur-xl border border-surface-700/50 rounded-xl overflow-hidden">
                {/* Loan Row */}
                <button
                  onClick={() => handleSelectLoan(loan._id)}
                  className="w-full p-6 text-left hover:bg-surface-800/20 transition-colors cursor-pointer"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-white font-bold">₹{loan.loanAmount.toLocaleString()}</p>
                        <p className="text-sm text-surface-400">{borrower?.fullName || borrower?.email}</p>
                      </div>
                      <span className={`px-3 py-0.5 text-xs font-medium rounded-full border ${
                        loan.status === 'closed'
                          ? 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                          : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      }`}>
                        {loan.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-surface-400">
                        ₹{loan.totalPaid.toFixed(2)} / ₹{loan.totalRepayment.toFixed(2)}
                      </p>
                      <div className="w-40 bg-surface-700 rounded-full h-1.5 mt-1">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            loan.status === 'closed' ? 'bg-emerald-500' : 'bg-primary-500'
                          }`}
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-surface-500 transition-transform ${isSelected ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded Section */}
                {isSelected && (
                  <div className="border-t border-surface-700/50 p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Payment Form */}
                      {loan.status === 'disbursed' && (
                        <div className="bg-surface-800/30 rounded-xl p-5">
                          <h4 className="text-sm font-medium text-white mb-4">Record Payment</h4>
                          <form onSubmit={handleRecordPayment} className="space-y-3">
                            <input
                              type="text"
                              value={utrNumber}
                              onChange={(e) => setUtrNumber(e.target.value)}
                              required
                              placeholder="UTR Number"
                              className="w-full px-3 py-2 bg-surface-800/50 border border-surface-600/50 rounded-lg text-white text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                            />
                            <input
                              type="number"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              required
                              min={1}
                              placeholder="Amount (₹)"
                              className="w-full px-3 py-2 bg-surface-800/50 border border-surface-600/50 rounded-lg text-white text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                            />
                            <input
                              type="date"
                              value={paymentDate}
                              onChange={(e) => setPaymentDate(e.target.value)}
                              required
                              className="w-full px-3 py-2 bg-surface-800/50 border border-surface-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                            />
                            <button
                              type="submit"
                              disabled={submitting}
                              className="w-full py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                            >
                              {submitting ? 'Recording...' : 'Record Payment'}
                            </button>
                          </form>

                          {summary && (
                            <div className="mt-4 text-sm space-y-1">
                              <div className="flex justify-between">
                                <span className="text-surface-400">Remaining:</span>
                                <span className="text-warning-500 font-medium">₹{summary.remainingBalance.toFixed(2)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Payment History */}
                      <div className={loan.status === 'closed' ? 'lg:col-span-2' : ''}>
                        <h4 className="text-sm font-medium text-white mb-3">Payment History</h4>
                        {paymentsLoading ? (
                          <div className="flex justify-center py-4">
                            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : payments.length === 0 ? (
                          <p className="text-surface-500 text-sm">No payments recorded yet.</p>
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {payments.map((payment) => (
                              <div
                                key={payment._id}
                                className="flex items-center justify-between bg-surface-800/30 rounded-lg px-4 py-3"
                              >
                                <div>
                                  <p className="text-sm text-white font-medium">₹{payment.amount.toLocaleString()}</p>
                                  <p className="text-xs text-surface-500">UTR: {payment.utrNumber}</p>
                                </div>
                                <p className="text-xs text-surface-400">{new Date(payment.date).toLocaleDateString()}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
