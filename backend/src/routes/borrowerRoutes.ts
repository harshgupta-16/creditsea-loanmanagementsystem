import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import upload from '../middleware/upload';
import {
  updateProfile,
  uploadSalarySlip,
  applyForLoan,
  getMyLoans,
} from '../controllers/borrowerController';

const router = Router();

// All borrower routes require authentication and borrower role
router.use(authenticate);
router.use(authorize('borrower'));

router.put('/profile', updateProfile);
router.post('/salary-slip', upload.single('salarySlip'), uploadSalarySlip);
router.post('/apply', applyForLoan);
router.get('/loans', getMyLoans);

export default router;
