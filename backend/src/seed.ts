import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

const seedUsers = [
  {
    email: 'admin@creditsea.com',
    password: 'Admin@123',
    role: 'admin',
    fullName: 'Admin User',
  },
  {
    email: 'sales@creditsea.com',
    password: 'Sales@123',
    role: 'sales',
    fullName: 'Sales Executive',
  },
  {
    email: 'sanction@creditsea.com',
    password: 'Sanction@123',
    role: 'sanction',
    fullName: 'Sanction Executive',
  },
  {
    email: 'disbursement@creditsea.com',
    password: 'Disbursement@123',
    role: 'disbursement',
    fullName: 'Disbursement Executive',
  },
  {
    email: 'collection@creditsea.com',
    password: 'Collection@123',
    role: 'collection',
    fullName: 'Collection Executive',
  },
  {
    email: 'borrower@creditsea.com',
    password: 'Borrower@123',
    role: 'borrower',
    fullName: 'Test Borrower',
  },
];

const seed = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/credit-sea';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    for (const userData of seedUsers) {
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        console.log(`⏭️  User ${userData.email} already exists, skipping...`);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const user = new User({
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        fullName: userData.fullName,
        profileComplete: userData.role !== 'borrower',
      });

      await user.save();
      console.log(`✅ Created ${userData.role}: ${userData.email}`);
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('─────────────────────────────────────────');
    seedUsers.forEach((u) => {
      console.log(`  ${u.role.padEnd(15)} | ${u.email.padEnd(30)} | ${u.password}`);
    });
    console.log('─────────────────────────────────────────');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
