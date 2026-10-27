require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/database');

const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const DoctorSchedule = require('../models/DoctorSchedule');
const HospitalSetting = require('../models/HospitalSetting');

const seedDemoData = async () => {
  try {
    await connectDB();
    console.log('Clearing existing demo collections...');

    await Promise.all([
      Department.deleteMany({}),
      User.deleteMany({}),
      Patient.deleteMany({}),
      Doctor.deleteMany({}),
      DoctorSchedule.deleteMany({}),
      HospitalSetting.deleteMany({})
    ]);

    console.log('Seeding Hospital Settings...');
    await HospitalSetting.create({
      hospitalName: 'St. Jude Metropolitan Hospital',
      tagline: 'Leading the Future of Digital & Compassionate Care',
      address: '742 Evergreen Healthcare Way, Metro City',
      contactPhone: '+1 (555) 019-2831',
      emergencyPhone: '+1 (555) 911-HELP',
      contactEmail: 'contact@stjude-hospital.org',
      openingHour: '08:00',
      closingHour: '18:00',
      defaultConsultationMinutes: 15
    });

    console.log('Seeding Departments...');
    const departments = await Department.create([
      {
        name: 'General Medicine',
        description: 'Comprehensive primary medical examinations and diagnosis',
        departmentCode: 'GENM',
        dailyTokenLimit: 60
      },
      {
        name: 'Cardiology',
        description: 'Advanced cardiovascular care, diagnostics, and heart treatments',
        departmentCode: 'CARD',
        dailyTokenLimit: 40
      },
      {
        name: 'Pediatrics',
        description: 'Compassionate pediatric healthcare for infants, children, and teens',
        departmentCode: 'PEDI',
        dailyTokenLimit: 50
      },
      {
        name: 'Orthopedics',
        description: 'Bone, joint, spine, and musculoskeletal system specialist consultations',
        departmentCode: 'ORTH',
        dailyTokenLimit: 35
      },
      {
        name: 'Dermatology',
        description: 'Diagnosis and treatment of skin, hair, and cosmetic conditions',
        departmentCode: 'DERM',
        dailyTokenLimit: 30
      }
    ]);

    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Hospital@123', salt);

    console.log('Seeding Users & Staff...');
    // 1. Admin
    const adminUser = await User.create({
      fullName: 'Dr. Robert Sullivan',
      email: 'admin@hospital.org',
      phone: '+1 (555) 100-0001',
      passwordHash: defaultPasswordHash,
      role: 'admin'
    });

    // 2. Receptionist
    const receptionistUser = await User.create({
      fullName: 'Sarah Jenkins',
      email: 'receptionist@hospital.org',
      phone: '+1 (555) 200-0002',
      passwordHash: defaultPasswordHash,
      role: 'receptionist'
    });

    // 3. Doctors
    const cardiologyDept = departments.find((d) => d.departmentCode === 'CARD');
    const pediatricsDept = departments.find((d) => d.departmentCode === 'PEDI');
    const generalDept = departments.find((d) => d.departmentCode === 'GENM');

    const doctorUser1 = await User.create({
      fullName: 'Dr. Alexander Vance',
      email: 'doctor.vance@hospital.org',
      phone: '+1 (555) 300-0001',
      passwordHash: defaultPasswordHash,
      role: 'doctor'
    });

    const doc1 = await Doctor.create({
      userId: doctorUser1._id,
      doctorNumber: 'DOC-101',
      departmentId: cardiologyDept._id,
      specialization: 'Senior Interventional Cardiologist',
      qualifications: 'MD, FACC, FSCAI',
      consultationDurationMinutes: 15,
      roomNumber: 'Cardio Suite 204',
      availability: 'Mon - Fri (09:00 - 16:30)',
      bio: 'Dr. Vance has over 16 years of experience in diagnostic angiography and heart disease management.'
    });

    const doctorUser2 = await User.create({
      fullName: 'Dr. Elena Rostova',
      email: 'doctor.rostova@hospital.org',
      phone: '+1 (555) 300-0002',
      passwordHash: defaultPasswordHash,
      role: 'doctor'
    });

    const doc2 = await Doctor.create({
      userId: doctorUser2._id,
      doctorNumber: 'DOC-102',
      departmentId: pediatricsDept._id,
      specialization: 'Lead Pediatric Specialist',
      qualifications: 'MD, FAAP',
      consultationDurationMinutes: 20,
      roomNumber: 'Pediatrics Suite 108',
      availability: 'Mon - Sat (08:30 - 15:00)',
      bio: 'Specialist in pediatric developmental health, preventive medicine, and immunization schedules.'
    });

    const doctorUser3 = await User.create({
      fullName: 'Dr. Marcus Brody',
      email: 'doctor.brody@hospital.org',
      phone: '+1 (555) 300-0003',
      passwordHash: defaultPasswordHash,
      role: 'doctor'
    });

    const doc3 = await Doctor.create({
      userId: doctorUser3._id,
      doctorNumber: 'DOC-103',
      departmentId: generalDept._id,
      specialization: 'Internal Medicine & Primary Care',
      qualifications: 'MBBS, MD (Internal Med)',
      consultationDurationMinutes: 15,
      roomNumber: 'Consultation Room 102',
      availability: 'Mon - Fri (09:00 - 17:00)',
      bio: 'Expert physician dedicated to accurate diagnosis and preventative adult healthcare.'
    });

    // Seed Schedules (Days 1 to 5: Monday through Friday)
    console.log('Seeding Doctor Schedules...');
    for (const doc of [doc1, doc2, doc3]) {
      for (let day = 1; day <= 5; day++) {
        await DoctorSchedule.create({
          doctorId: doc._id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          breakPeriods: [{ start: '13:00', end: '14:00' }],
          slotDurationMinutes: doc.consultationDurationMinutes,
          maximumAppointments: 25,
          isActive: true
        });
      }
    }

    // 4. Sample Patient
    console.log('Seeding Sample Patient...');
    const patientUser = await User.create({
      fullName: 'Johnathan Doe',
      email: 'patient@hospital.org',
      phone: '+1 (555) 400-0001',
      passwordHash: defaultPasswordHash,
      role: 'patient'
    });

    await Patient.create({
      userId: patientUser._id,
      patientNumber: 'PAT-10001',
      dateOfBirth: new Date('1990-05-15'),
      gender: 'male',
      address: {
        street: '42 Pine Crest Street',
        city: 'Metro City',
        state: 'NY',
        zipCode: '10001'
      },
      bloodGroup: 'O+'
    });

    console.log('\n======================================================');
    console.log('  DEMO DATABASE SEEDED SUCCESSFULLY!                 ');
    console.log('======================================================');
    console.log('Sample Accounts (Password for all: Hospital@123):');
    console.log('1. Admin:        admin@hospital.org');
    console.log('2. Receptionist: receptionist@hospital.org');
    console.log('3. Doctor:       doctor.vance@hospital.org (Cardiology)');
    console.log('4. Doctor:       doctor.rostova@hospital.org (Pediatrics)');
    console.log('5. Doctor:       doctor.brody@hospital.org (Gen Medicine)');
    console.log('6. Patient:      patient@hospital.org');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Failed to seed demo data:', error.message);
    process.exit(1);
  }
};

seedDemoData();
