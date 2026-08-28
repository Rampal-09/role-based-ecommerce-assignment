require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/role_ecommerce_db';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected for admin seeding.');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.');
      console.log('Please define ADMIN_EMAIL and ADMIN_PASSWORD in your .env file.');
      process.exit(1);
    }

    const normalizedEmail = adminEmail.trim().toLowerCase();

    // Check if an admin user already exists
    const existingAdmin = await User.findOne({
      $or: [{ role: 'admin' }, { email: normalizedEmail }],
    });

    if (existingAdmin) {
      console.log(`Admin account already exists: ${existingAdmin.email} (Role: ${existingAdmin.role})`);
      await mongoose.disconnect();
      console.log('Admin seed complete. No duplicate created.');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const newAdmin = await User.create({
      name: 'System Admin',
      email: normalizedEmail,
      password: hashedPassword,
      role: 'admin',
    });

    console.log(`Admin user created successfully! Email: ${newAdmin.email}, Role: ${newAdmin.role}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

seedAdmin();
