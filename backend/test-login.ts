import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/User';

dotenv.config();

const testLogin = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    console.log('Connecting to:', mongoURI);
    await mongoose.connect(mongoURI as string);
    console.log('Connected.');

    const email = 'borrower@creditsea.com';
    const password = 'Borrower@123';

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('User not found in DB!');
      const allUsers = await User.find({}, { email: 1 });
      console.log('All users in DB:', allUsers);
    } else {
      console.log('User found:', user.email);
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match:', isMatch);
    }
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

testLogin();
