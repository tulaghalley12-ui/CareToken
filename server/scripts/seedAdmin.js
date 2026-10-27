require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hospital.org';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@Secure2026';
    const adminPhone = process.env.ADMIN_PHONE || '+1 (555) 100-0001';
    const adminName = process.env.ADMIN_NAME || 'System Administrator';

    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (existingAdmin) {
      console.log(`Admin account '${adminEmail}' already exists. Nothing changed.`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const adminUser = await User.create({
      fullName: adminName,
      email: adminEmail.toLowerCase(),
      phone: adminPhone,
      passwordHash,
      role: 'admin',
      isActive: true
    });

    console.log('========================================================');
    console.log('  Initial Administrator Account Created Successfully!  ');
    console.log('========================================================');
    console.log(`  Full Name: ${adminUser.fullName}`);
    console.log(`  Email:     ${adminUser.email}`);
    console.log(`  Password:  ${adminPassword}`);
    console.log(`  Role:      ${adminUser.role}`);
    console.log('========================================================');
    console.log('IMPORTANT: Please change this default password upon login!');

    process.exit(0);
  } catch (error) {
    console.error('Failed to create admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
