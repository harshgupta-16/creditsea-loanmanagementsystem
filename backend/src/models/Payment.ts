import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  loan: mongoose.Types.ObjectId;
  utrNumber: string;
  amount: number;
  date: Date;
  collectedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    loan: {
      type: Schema.Types.ObjectId,
      ref: 'Loan',
      required: true,
    },
    utrNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    date: {
      type: Date,
      required: true,
    },
    collectedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPayment>('Payment', paymentSchema);
