export interface User {
  id: string;
  email: string;
  role: 'admin' | 'sales' | 'sanction' | 'disbursement' | 'collection' | 'borrower';
  fullName?: string;
  pan?: string;
  dateOfBirth?: string;
  monthlySalary?: number;
  employmentMode?: 'salaried' | 'self-employed' | 'unemployed';
  salarySlipUrl?: string;
  profileComplete: boolean;
}

export interface Loan {
  _id: string;
  borrower: User | string;
  loanAmount: number;
  tenure: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  totalPaid: number;
  status: 'applied' | 'sanctioned' | 'rejected' | 'disbursed' | 'closed';
  rejectionReason?: string;
  sanctionedBy?: User | string;
  disbursedBy?: User | string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  loan: string;
  utrNumber: string;
  amount: number;
  date: string;
  collectedBy: User | string;
  createdAt: string;
}

export interface Lead {
  id: string;
  email: string;
  fullName: string;
  profileComplete: boolean;
  hasLoan: boolean;
  loanCount: number;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface BREError {
  message: string;
  errors: string[];
  breRejected: boolean;
}

export interface PaymentSummary {
  totalRepayment: number;
  totalPaid: number;
  remainingBalance: number;
  status: string;
}
