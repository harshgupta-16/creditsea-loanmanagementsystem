import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Loan from '../models/Loan';
import Payment from '../models/Payment';

// Sales: Get leads (registered users who haven't applied for loans yet)
export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Find all borrowers
    const borrowers = await User.find({ role: 'borrower' }).select('-password').sort({ createdAt: -1 });

    // For each borrower, check if they have any loans
    const leadsWithLoanInfo = await Promise.all(
      borrowers.map(async (borrower) => {
        const loanCount = await Loan.countDocuments({ borrower: borrower._id });
        return {
          id: borrower._id,
          email: borrower.email,
          fullName: borrower.fullName || 'N/A',
          profileComplete: borrower.profileComplete,
          hasLoan: loanCount > 0,
          loanCount,
          createdAt: borrower.createdAt,
        };
      })
    );

    res.json({ leads: leadsWithLoanInfo });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ message: 'Server error fetching leads.' });
  }
};

// Get loans filtered by status (used by multiple dashboard modules)
export const getLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    const filter: any = {};
    if (status) {
      if (typeof status === 'string' && status.includes(',')) {
        filter.status = { $in: status.split(',') };
      } else {
        filter.status = status;
      }
    }

    const loans = await Loan.find(filter)
      .populate('borrower', 'email fullName pan monthlySalary employmentMode')
      .populate('sanctionedBy', 'email fullName')
      .populate('disbursedBy', 'email fullName')
      .sort({ createdAt: -1 });

    res.json({ loans });
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ message: 'Server error fetching loans.' });
  }
};

// Sanction: Approve a loan
export const sanctionLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated.' });
      return;
    }

    const { id } = req.params;
    const loan = await Loan.findById(id);

    if (!loan) {
      res.status(404).json({ message: 'Loan not found.' });
      return;
    }

    if (loan.status !== 'applied') {
      res.status(400).json({ message: `Cannot sanction a loan with status "${loan.status}". Only "applied" loans can be sanctioned.` });
      return;
    }

    loan.status = 'sanctioned';
    loan.sanctionedBy = req.user._id as any;
    await loan.save();

    res.json({ message: 'Loan sanctioned successfully.', loan });
  } catch (error) {
    console.error('Sanction loan error:', error);
    res.status(500).json({ message: 'Server error sanctioning loan.' });
  }
};

// Sanction: Reject a loan
export const rejectLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated.' });
      return;
    }

    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      res.status(400).json({ message: 'Rejection reason is required.' });
      return;
    }

    const loan = await Loan.findById(id);

    if (!loan) {
      res.status(404).json({ message: 'Loan not found.' });
      return;
    }

    if (loan.status !== 'applied') {
      res.status(400).json({ message: `Cannot reject a loan with status "${loan.status}". Only "applied" loans can be rejected.` });
      return;
    }

    loan.status = 'rejected';
    loan.rejectionReason = reason;
    loan.sanctionedBy = req.user._id as any;
    await loan.save();

    res.json({ message: 'Loan rejected.', loan });
  } catch (error) {
    console.error('Reject loan error:', error);
    res.status(500).json({ message: 'Server error rejecting loan.' });
  }
};

// Disbursement: Disburse a loan
export const disburseLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated.' });
      return;
    }

    const { id } = req.params;
    const loan = await Loan.findById(id);

    if (!loan) {
      res.status(404).json({ message: 'Loan not found.' });
      return;
    }

    if (loan.status !== 'sanctioned') {
      res.status(400).json({ message: `Cannot disburse a loan with status "${loan.status}". Only "sanctioned" loans can be disbursed.` });
      return;
    }

    loan.status = 'disbursed';
    loan.disbursedBy = req.user._id as any;
    await loan.save();

    res.json({ message: 'Loan disbursed successfully.', loan });
  } catch (error) {
    console.error('Disburse loan error:', error);
    res.status(500).json({ message: 'Server error disbursing loan.' });
  }
};

// Collection: Record a payment
export const recordPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated.' });
      return;
    }

    const { id } = req.params;
    const { utrNumber, amount, date } = req.body;

    if (!utrNumber || !amount || !date) {
      res.status(400).json({ message: 'UTR number, amount, and date are required.' });
      return;
    }

    if (amount <= 0) {
      res.status(400).json({ message: 'Payment amount must be greater than zero.' });
      return;
    }

    const loan = await Loan.findById(id);

    if (!loan) {
      res.status(404).json({ message: 'Loan not found.' });
      return;
    }

    if (loan.status !== 'disbursed') {
      res.status(400).json({ message: `Cannot record payment for a loan with status "${loan.status}". Only "disbursed" loans can accept payments.` });
      return;
    }

    // Check for duplicate UTR
    const existingPayment = await Payment.findOne({ utrNumber });
    if (existingPayment) {
      res.status(400).json({ message: 'A payment with this UTR number already exists.' });
      return;
    }

    // Check if payment would exceed remaining balance
    const remainingBalance = loan.totalRepayment - loan.totalPaid;
    if (amount > remainingBalance) {
      res.status(400).json({
        message: `Payment amount (₹${amount}) exceeds remaining balance (₹${remainingBalance.toFixed(2)}).`,
      });
      return;
    }

    // Create payment
    const payment = new Payment({
      loan: loan._id,
      utrNumber,
      amount,
      date: new Date(date),
      collectedBy: req.user._id,
    });

    await payment.save();

    // Update loan totalPaid
    loan.totalPaid += amount;

    // Auto-close if fully paid
    if (loan.totalPaid >= loan.totalRepayment) {
      loan.status = 'closed';
    }

    await loan.save();

    res.status(201).json({
      message: loan.status === 'closed'
        ? 'Payment recorded. Loan is now fully paid and closed.'
        : 'Payment recorded successfully.',
      payment,
      loan,
    });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({ message: 'Server error recording payment.' });
  }
};

// Collection: Get payments for a loan
export const getPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const payments = await Payment.find({ loan: id })
      .populate('collectedBy', 'email fullName')
      .sort({ date: -1 });

    const loan = await Loan.findById(id);

    res.json({
      payments,
      summary: loan
        ? {
            totalRepayment: loan.totalRepayment,
            totalPaid: loan.totalPaid,
            remainingBalance: Math.max(0, loan.totalRepayment - loan.totalPaid),
            status: loan.status,
          }
        : null,
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error fetching payments.' });
  }
};

// Admin: Get all users
export const getAllUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
};
