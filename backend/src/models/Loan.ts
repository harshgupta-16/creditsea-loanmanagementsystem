import mongoose, { Schema, Document } from 'mongoose';

export interface ILoan extends Document {
  borrower: mongoose.Types.ObjectId;
  loanAmount: number;
  tenure: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  totalPaid: number;
  status: 'applied' | 'sanctioned' | 'rejected' | 'disbursed' | 'closed';
  rejectionReason?: string;
  sanctionedBy?: mongoose.Types.ObjectId;
  disbursedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const loanSchema = new Schema<ILoan>(
  {
    borrower: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    loanAmount: {
      type: Number,
      required: true,
      min: 50000,
      max: 500000,
    },
    tenure: {
      type: Number,
      required: true,
      min: 30,
      max: 365,
    },
    interestRate: {
      type: Number,
      default: 12,
    },
    simpleInterest: {
      type: Number,
      required: true,
    },
    totalRepayment: {
      type: Number,
      required: true,
    },
    totalPaid: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['applied', 'sanctioned', 'rejected', 'disbursed', 'closed'],
      default: 'applied',
    },
    rejectionReason: {
      type: String,
    },
    sanctionedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    disbursedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ILoan>('Loan', loanSchema);
