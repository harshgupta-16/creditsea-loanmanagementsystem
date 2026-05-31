'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function ApplyPage() {
  const { user, loading, refreshUser, logout } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState('');

  // Step 1: Personal Details
  const [fullName, setFullName] = useState('');
  const [pan, setPan] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [monthlySalary, setMonthlySalary] = useState('');
  const [employmentMode, setEmploymentMode] = useState('');

  // Step 2: Salary Slip
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');

  // Step 3: Loan Config
  const [loanAmount, setLoanAmount] = useState(200000);
  const [tenure, setTenure] = useState(180);

  const initializeStep = useCallback(() => {
    if (user) {
      if (user.profileComplete && user.salarySlipUrl) {
        setCurrentStep(3);
      } else if (user.profileComplete) {
        setCurrentStep(2);
      } else {
        setCurrentStep(1);
      }

      // Pre-fill fields
      if (user.fullName) setFullName(user.fullName);
      if (user.pan) setPan(user.pan);
      if (user.dateOfBirth) setDateOfBirth(user.dateOfBirth.split('T')[0]);
      if (user.monthlySalary) setMonthlySalary(String(user.monthlySalary));
      if (user.employmentMode) setEmploymentMode(user.employmentMode);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'borrower') {
      router.push('/dashboard');
      return;
    }
    initializeStep();
  }, [user, loading, router, initializeStep]);

  // Loan calculation
  const interestRate = 12;
  const simpleInterest = (loanAmount * interestRate * tenure) / (365 * 100);
  const totalRepayment = loanAmount + simpleInterest;

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);

    try {
      await api.updateProfile({
        fullName,
        pan: pan.toUpperCase(),
        dateOfBirth,
        monthlySalary: Number(monthlySalary),
        employmentMode,
      });
      await refreshUser();
      setCurrentStep(2);
      setSuccess('Profile updated. Eligibility check passed!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors([err.message || 'Failed to update profile.']);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrors(['Please select a file to upload.']);
      return;
    }

    setErrors([]);
    setSubmitting(true);

    try {
      await api.uploadSalarySlip(file);
      await refreshUser();
      setUploadStatus('Salary slip uploaded successfully!');
      setCurrentStep(3);
      setSuccess('Salary slip uploaded!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setErrors([err.message || 'Failed to upload salary slip.']);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApply = async () => {
    setErrors([]);
    setSubmitting(true);

    try {
      await api.applyForLoan(loanAmount, tenure);
      setSuccess('Loan application submitted successfully!');
      setTimeout(() => {
        router.push('/my-loans');
      }, 2000);
    } catch (err: any) {
      setErrors([err.message || 'Failed to apply for loan.']);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'Personal Details' },
    { number: 2, title: 'Upload Salary Slip' },
    { number: 3, title: 'Loan Configuration' },
  ];

  return (
    <div className="min-h-screen bg-surface-950 relative overflow-x-hidden mesh-bg">
      <div className="absolute inset-0 dot-pattern pointer-events-none opacity-40" />

      {/* Header */}
      <header className="bg-surface-950/80 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-accent-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-white text-sm">CreditSea</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/my-loans')}
              className="text-xs text-surface-400 hover:text-white transition-colors cursor-pointer font-medium"
            >
              My Loans
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

      <div className="max-w-3xl mx-auto px-4 py-8 relative z-10">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-10">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    currentStep >= step.number
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/25'
                      : 'bg-surface-800 text-surface-500 border border-surface-600'
                  }`}
                >
                  {currentStep > step.number ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span className={`text-xs mt-2 ${currentStep >= step.number ? 'text-primary-400' : 'text-surface-500'}`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-20 h-0.5 mx-2 mt-5 transition-all duration-300 ${
                  currentStep > step.number ? 'bg-primary-500' : 'bg-surface-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Messages */}
        {errors.length > 0 && (
          <div className="mb-6 bg-danger-500/10 border border-danger-500/30 rounded-xl p-4">
            <p className="text-danger-500 font-medium text-sm mb-1">Eligibility Check Failed</p>
            <ul className="list-disc list-inside text-danger-500/80 text-sm space-y-1">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-success-500/10 border border-success-500/30 rounded-xl p-4">
            <p className="text-success-500 text-sm">{success}</p>
          </div>
        )}

        {/* Step 1: Personal Details */}
        {currentStep === 1 && (
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Personal Details</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-surface-300 mb-2">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="glass-input"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="pan" className="block text-sm font-medium text-surface-300 mb-2">PAN Number</label>
                <input
                  id="pan"
                  type="text"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  required
                  maxLength={10}
                  className="glass-input uppercase"
                  placeholder="ABCDE1234F"
                />
              </div>

              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-surface-300 mb-2">Date of Birth</label>
                <input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                  className="glass-input"
                />
              </div>

              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-surface-300 mb-2">Monthly Salary (₹)</label>
                <input
                  id="salary"
                  type="number"
                  value={monthlySalary}
                  onChange={(e) => setMonthlySalary(e.target.value)}
                  required
                  min={0}
                  className="glass-input"
                  placeholder="Enter monthly salary"
                />
              </div>

              <div>
                <label htmlFor="employment" className="block text-sm font-medium text-surface-300 mb-2">Employment Mode</label>
                <select
                  id="employment"
                  value={employmentMode}
                  onChange={(e) => setEmploymentMode(e.target.value)}
                  required
                  className="glass-input"
                >
                  <option value="">Select employment mode</option>
                  <option value="salaried">Salaried</option>
                  <option value="self-employed">Self-Employed</option>
                  <option value="unemployed">Unemployed</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 glass-button rounded-xl mt-4"
              >
                {submitting ? 'Checking Eligibility...' : 'Check Eligibility & Continue'}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Upload Salary Slip */}
        {currentStep === 2 && (
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Upload Salary Slip</h2>
            <form onSubmit={handleFileUpload} className="space-y-6">
              <div
                className="border-2 border-dashed border-surface-600/50 rounded-xl p-8 text-center hover:border-primary-500/50 transition-all cursor-pointer"
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <svg className="w-12 h-12 text-surface-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-surface-300 font-medium">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-surface-500 text-sm mt-1">PDF, JPG, or PNG (max 5MB)</p>
                <input
                  id="fileInput"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </div>

              {uploadStatus && (
                <p className="text-success-500 text-sm">{uploadStatus}</p>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 py-3 px-4 bg-surface-800 hover:bg-surface-700 text-surface-300 font-medium rounded-xl transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!file || submitting}
                  className="flex-1 py-3.5 px-4 glass-button rounded-xl"
                >
                  {submitting ? 'Uploading...' : 'Upload & Continue'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Loan Configuration */}
        {currentStep === 3 && (
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Loan Configuration</h2>

            <div className="space-y-8">
              {/* Loan Amount Slider */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-surface-300">Loan Amount</label>
                  <span className="text-lg font-bold text-primary-400">₹{loanAmount.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={50000}
                  max={500000}
                  step={10000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full h-2 bg-surface-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-xs text-surface-500 mt-1">
                  <span>₹50,000</span>
                  <span>₹5,00,000</span>
                </div>
              </div>

              {/* Tenure Slider */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-surface-300">Tenure</label>
                  <span className="text-lg font-bold text-primary-400">{tenure} days</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={365}
                  step={1}
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full h-2 bg-surface-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-xs text-surface-500 mt-1">
                  <span>30 days</span>
                  <span>365 days</span>
                </div>
              </div>

              {/* Calculation Panel */}
              <div className="bg-surface-800/50 border border-surface-600/30 rounded-xl p-6">
                <h3 className="text-sm font-medium text-surface-400 mb-4 uppercase tracking-wider">Loan Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-surface-400">Principal Amount</span>
                    <span className="text-white font-medium">₹{loanAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-400">Interest Rate</span>
                    <span className="text-white font-medium">{interestRate}% p.a.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-400">Tenure</span>
                    <span className="text-white font-medium">{tenure} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-400">Simple Interest</span>
                    <span className="text-warning-500 font-medium">₹{simpleInterest.toFixed(2)}</span>
                  </div>
                  <hr className="border-surface-600/30" />
                  <div className="flex justify-between">
                    <span className="text-white font-bold">Total Repayment</span>
                    <span className="text-primary-400 font-bold text-lg">₹{totalRepayment.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Formula info */}
              <div className="text-xs text-surface-500 bg-surface-800/30 rounded-lg p-3">
                <p>SI = (P × R × T) / (365 × 100) where T = tenure in days</p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 py-3 px-4 bg-surface-800 hover:bg-surface-700 text-surface-300 font-medium rounded-xl transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleApply}
                  disabled={submitting}
                  className="flex-1 py-3.5 px-4 glass-button rounded-xl"
                >
                  {submitting ? 'Submitting...' : 'Apply for Loan'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
