import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Loan from '../models/Loan';
import { runBRE, calculateLoan } from '../utils/bre';

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated.' });
      return;
    }

    const { fullName, pan, dateOfBirth, monthlySalary, employmentMode } = req.body;

    // Run BRE checks
    const breResult = runBRE({
      dateOfBirth,
      monthlySalary,
      pan,
      employmentMode,
    });

    if (!breResult.passed) {
      res.status(400).json({
        message: 'Eligibility check failed.',
        errors: breResult.errors,
        breRejected: true,
      });
      return;
    }

    // Update profile
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        fullName,
        pan: pan?.toUpperCase(),
        dateOfBirth: new Date(dateOfBirth),
        monthlySalary,
        employmentMode,
        profileComplete: true,
      },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully. Eligibility check passed.',
      user: {
        id: user?._id,
        email: user?.email,
        role: user?.role,
        fullName: user?.fullName,
        pan: user?.pan,
        dateOfBirth: user?.dateOfBirth,
        monthlySalary: user?.monthlySalary,
        employmentMode: user?.employmentMode,
        salarySlipUrl: user?.salarySlipUrl,
        profileComplete: user?.profileComplete,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
};

export const uploadSalarySlip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated.' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded. Please upload a salary slip (PDF/JPG/PNG, max 5MB).' });
      return;
    }

    const salarySlipUrl = `/uploads/${req.file.filename}`;

    await User.findByIdAndUpdate(req.user._id, { salarySlipUrl });

    res.json({
      message: 'Salary slip uploaded successfully.',
      salarySlipUrl,
    });
  } catch (error) {
    console.error('Upload salary slip error:', error);
    res.status(500).json({ message: 'Server error uploading salary slip.' });
  }
};

export const applyForLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated.' });
      return;
    }

    // Check profile completion
    const user = await User.findById(req.user._id);
    if (!user?.profileComplete) {
      res.status(400).json({ message: 'Please complete your profile before applying for a loan.' });
      return;
    }

    if (!user?.salarySlipUrl) {
      res.status(400).json({ message: 'Please upload your salary slip before applying for a loan.' });
      return;
    }

    const { loanAmount, tenure } = req.body;

    if (!loanAmount || !tenure) {
      res.status(400).json({ message: 'Loan amount and tenure are required.' });
      return;
    }

    if (loanAmount < 50000 || loanAmount > 500000) {
      res.status(400).json({ message: 'Loan amount must be between ₹50,000 and ₹5,00,000.' });
      return;
    }

    if (tenure < 30 || tenure > 365) {
      res.status(400).json({ message: 'Tenure must be between 30 and 365 days.' });
      return;
    }

    const { simpleInterest, totalRepayment } = calculateLoan(loanAmount, tenure, 12);

    const loan = new Loan({
      borrower: req.user._id,
      loanAmount,
      tenure,
      interestRate: 12,
      simpleInterest,
      totalRepayment,
      status: 'applied',
    });

    await loan.save();

    res.status(201).json({
      message: 'Loan application submitted successfully.',
      loan,
    });
  } catch (error) {
    console.error('Apply for loan error:', error);
    res.status(500).json({ message: 'Server error applying for loan.' });
  }
};

export const getMyLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated.' });
      return;
    }

    const loans = await Loan.find({ borrower: req.user._id }).sort({ createdAt: -1 });

    res.json({ loans });
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ message: 'Server error fetching loans.' });
  }
};
