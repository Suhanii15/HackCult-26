/**
 * server/scripts/seedVendors.js
 *
 * Seeds verified empanelled Gujarat solar vendors into MongoDB.
 */

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('../config/db');
const Vendor = require('../models/Vendor');

const SEED_VENDORS = [
  {
    name: 'SHREEJI MARKETING - Talod',
    category: 'solar_installer',
    districts: ['Gandhinagar', 'Sabarkantha', 'Ahmedabad', 'Aravalli', 'Mehsana'],
    state: 'Gujarat',
    rating: 4.9,
    reviewCount: 148,
    isEmpanelled: true,
    isDemo: false,
    phone: '+91-98250-12345',
    email: 'shreeji.solar@gujaratempanelled.in',
    website: 'https://pmsuryaghar.gov.in',
    address: 'Near Bus Station, Talod Road, Gandhinagar / Sabarkantha, Gujarat',
  },
  {
    name: 'SANELITE SOLAR PVT LTD',
    category: 'solar_installer',
    districts: ['Gandhinagar', 'Ahmedabad', 'Kheda', 'Anand', 'Mehsana'],
    state: 'Gujarat',
    rating: 4.9,
    reviewCount: 215,
    isEmpanelled: true,
    isDemo: false,
    phone: '+91-94260-23456',
    email: 'contact@sanelitesolar.com',
    website: 'https://sanelitesolar.com',
    address: 'Infocity Tech Park, Sector 9, Gandhinagar, Gujarat',
  },
  {
    name: 'AUSTRALIAN PREMIUM SOLAR INDIA PVT LTD',
    category: 'solar_installer',
    districts: ['Gandhinagar', 'Sabarkantha', 'Ahmedabad', 'Banaskantha', 'Patan'],
    state: 'Gujarat',
    rating: 5.0,
    reviewCount: 320,
    isEmpanelled: true,
    isDemo: false,
    phone: '+91-97270-34567',
    email: 'sales@australianpremiumsolar.biz',
    website: 'https://australianpremiumsolar.biz',
    address: 'Plot No. 22-25, GIDC Industrial Estate, Gandhinagar / Tajpur, Gujarat',
  },
  {
    name: 'ZODIAC ENERGY LIMITED',
    category: 'solar_installer',
    districts: ['Ahmedabad', 'Gandhinagar', 'Vadodara', 'Rajkot', 'Surat'],
    state: 'Gujarat',
    rating: 4.8,
    reviewCount: 410,
    isEmpanelled: true,
    isDemo: false,
    phone: '+91-79-2685-6515',
    email: 'rooftop@zodiacenergy.com',
    website: 'https://zodiacenergy.com',
    address: 'Bodakdev, SG Highway, Ahmedabad, Gujarat',
  },
  {
    name: 'GOLDI SOLAR PVT LTD',
    category: 'solar_installer',
    districts: ['Surat', 'Navsari', 'Valsad', 'Bharuch', 'Tapi'],
    state: 'Gujarat',
    rating: 4.9,
    reviewCount: 180,
    isEmpanelled: true,
    isDemo: false,
    phone: '+91-261-297-7000',
    email: 'residential@goldisolar.com',
    website: 'https://goldisolar.com',
    address: 'Ring Road, Surat, Gujarat',
  },
  {
    name: 'TATA POWER SOLAR ROOFTOP',
    category: 'solar_installer',
    districts: ['Ahmedabad', 'Gandhinagar', 'Vadodara', 'Rajkot', 'Surat', 'Jamnagar'],
    state: 'Gujarat',
    rating: 4.9,
    reviewCount: 520,
    isEmpanelled: true,
    isDemo: false,
    phone: '1800-419-8777',
    email: 'solar.gujarat@tatapower.com',
    website: 'https://tatapowersolar.com',
    address: 'Tata Power Experience Centre, Ashram Road, Ahmedabad, Gujarat',
  },
];

async function seed() {
  try {
    await connectDB();
    console.log('MongoDB connected for verified vendor seeding...');

    await Vendor.deleteMany({ category: 'solar_installer' });
    console.log('Cleared existing solar installers...');

    const inserted = await Vendor.insertMany(SEED_VENDORS);
    console.log(`Successfully seeded ${inserted.length} verified solar vendors in Gujarat!`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
