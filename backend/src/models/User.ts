import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'admin' | 'sales' | 'sanction' | 'disbursement' | 'collection' | 'borrower';
  fullName?: string;
  pan?: string;
  dateOfBirth?: Date;
  monthlySalary?: number;
  employmentMode?: 'salaried' | 'self-employed' | 'unemployed';
  salarySlipUrl?: string;
  profileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'sales', 'sanction', 'disbursement', 'collection', 'borrower'],
      default: 'borrower',
    },
    fullName: {
      type: String,
      trim: true,
    },
    pan: {
      type: String,
      uppercase: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    monthlySalary: {
      type: Number,
    },
    employmentMode: {
      type: String,
      enum: ['salaried', 'self-employed', 'unemployed'],
    },
    salarySlipUrl: {
      type: String,
    },
    profileComplete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', userSchema);
