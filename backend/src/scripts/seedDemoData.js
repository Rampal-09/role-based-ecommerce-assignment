require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');

const seedDemoData = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/role_ecommerce_db';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB for demo data seeding.');

    // 1. Seed Categories
    const defaultCategories = ['Electronics', 'Fashion', 'Footwear', 'Home', 'Beauty', 'Sports'];
    for (const catName of defaultCategories) {
      await Category.findOneAndUpdate(
        { name: catName },
        { name: catName },
        { upsert: true, new: true }
      );
    }
    console.log('Categories seeded.');

    // 2. Seed Users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Demo@12345', salt);

    const demoUsers = [
      {
        name: 'System Admin',
        email: 'admin@example.com',
        password: passwordHash,
        role: 'admin',
      },
      {
        name: 'Sarah Seller',
        email: 'sales@example.com',
        password: passwordHash,
        role: 'sales',
      },
      {
        name: 'Alex Customer',
        email: 'user@example.com',
        password: passwordHash,
        role: 'user',
      },
    ];

    const userMap = {};
    for (const userData of demoUsers) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create(userData);
        console.log(`Created demo user: ${user.email} (${user.role})`);
      } else {
        user.role = userData.role;
        user.password = passwordHash;
        await user.save();
        console.log(`Updated demo user: ${user.email} (${user.role})`);
      }
      userMap[userData.role] = user;
    }

    // 3. Seed Sample Products for Sales Person
    const existingProductsCount = await Product.countDocuments();
    if (existingProductsCount === 0) {
      const sampleProducts = [
        {
          name: 'Pro Wireless ANC Headphones',
          description: 'Premium active noise-cancelling over-ear headphones with 40-hour battery life and spatial audio.',
          price: 14999,
          category: 'Electronics',
          stock: 25,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60',
          owner: userMap['sales']._id,
        },
        {
          name: 'Classic Oxford Cotton Shirt',
          description: 'Tailored fit breathable 100% Egyptian cotton button-down shirt suitable for business and casual.',
          price: 2499,
          category: 'Fashion',
          stock: 40,
          image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=60',
          owner: userMap['sales']._id,
        },
        {
          name: 'Ultralight Aerodynamic Running Shoes',
          description: 'High-cushion responsive running sneakers designed for marathon training and daily endurance workouts.',
          price: 4999,
          category: 'Footwear',
          stock: 18,
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60',
          owner: userMap['sales']._id,
        },
        {
          name: 'Smart Ambient Desk Lamp',
          description: 'Minimalist dimmable LED desk lamp with touch controls, wireless phone charger base, and RGB ambient glow.',
          price: 3299,
          category: 'Home',
          stock: 30,
          image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=60',
          owner: userMap['sales']._id,
        },
      ];

      await Product.insertMany(sampleProducts);
      console.log('Sample products seeded.');
    }

    console.log('\nDemo data seeding completed successfully!');
    console.log('====================================');
    console.log('Admin:  admin@example.com / Demo@12345');
    console.log('Sales:  sales@example.com / Demo@12345');
    console.log('User:   user@example.com  / Demo@12345');
    console.log('====================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding demo data:', err);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

seedDemoData();
