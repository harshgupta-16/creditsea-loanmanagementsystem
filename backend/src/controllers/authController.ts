import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName,
      role: 'borrower',
    });

    await user.save();

    const jwtSecret = process.env.JWT_SECRET || 'default_secret';
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful.',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        profileComplete: user.profileComplete,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'default_secret';
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '7d' });

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        profileComplete: user.profileComplete,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated.' });
      return;
    }

    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        fullName: req.user.fullName,
        pan: req.user.pan,
        dateOfBirth: req.user.dateOfBirth,
        monthlySalary: req.user.monthlySalary,
        employmentMode: req.user.employmentMode,
        salarySlipUrl: req.user.salarySlipUrl,
        profileComplete: req.user.profileComplete,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
