import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getLeads,
  getLoans,
  sanctionLoan,
  rejectLoan,
  disburseLoan,
  recordPayment,
  getPayments,
  getAllUsers,
} from '../controllers/dashboardController';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

// Sales routes - accessible by sales and admin
router.get('/leads', authorize('sales', 'admin'), getLeads);

// Loan listing - accessible by all dashboard roles
router.get('/loans', authorize('sales', 'sanction', 'disbursement', 'collection', 'admin'), getLoans);

// Sanction routes
router.put('/loans/:id/sanction', authorize('sanction', 'admin'), sanctionLoan);
router.put('/loans/:id/reject', authorize('sanction', 'admin'), rejectLoan);

// Disbursement routes
router.put('/loans/:id/disburse', authorize('disbursement', 'admin'), disburseLoan);

// Collection routes
router.post('/loans/:id/payment', authorize('collection', 'admin'), recordPayment);
router.get('/loans/:id/payments', authorize('collection', 'admin'), getPayments);

// Admin routes
router.get('/users', authorize('admin'), getAllUsers);

export default router;
