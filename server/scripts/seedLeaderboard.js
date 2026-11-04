const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const SEED_USERS = [
  // Ahmedabad - Vastrapur (Same ward as default/Suhani)
  {
    fullName: 'Priya Patel',
    email: 'priya.patel@gujarat.in',
    state: 'Gujarat',
    district: 'Ahmedabad',
    city: 'Vastrapur',
    totalPoints: 1850,
    ecoScore: 96,
    baselineAnnualCO2Kg: 1420,
    currentStreakDays: 14,
    badgesEarned: [{ badgeCode: 'SOLAR_CHAMP', badgeName: 'Solar Pioneer' }],
  },
  {
    fullName: 'Rohan Sharma',
    email: 'rohan.sharma@gujarat.in',
    state: 'Gujarat',
    district: 'Ahmedabad',
    city: 'Vastrapur',
    totalPoints: 1420,
    ecoScore: 91,
    baselineAnnualCO2Kg: 1890,
    currentStreakDays: 11,
    badgesEarned: [{ badgeCode: 'EV_COMMUTER', badgeName: 'Zero-Emission Commuter' }],
  },
  {
    fullName: 'Amit Shah',
    email: 'amit.shah@gujarat.in',
    state: 'Gujarat',
    district: 'Ahmedabad',
    city: 'Vastrapur',
    totalPoints: 1080,
    ecoScore: 88,
    baselineAnnualCO2Kg: 2150,
    currentStreakDays: 9,
    badgesEarned: [{ badgeCode: 'RECYCLE_STAR', badgeName: 'Circular Champion' }],
  },

  // Ahmedabad - Other Wards (Bodakdev, Satellite, Navrangpura, Bopal, Chandkheda)
  {
    fullName: 'Aarav Mehta',
    email: 'aarav.mehta@gujarat.in',
    state: 'Gujarat',
    district: 'Ahmedabad',
    city: 'Bodakdev',
    totalPoints: 1290,
    ecoScore: 89,
    baselineAnnualCO2Kg: 1750,
    currentStreakDays: 12,
    badgesEarned: [{ badgeCode: 'WATER_SAVER', badgeName: 'Hydro Guardian' }],
  },
  {
    fullName: 'Neha Joshi',
    email: 'neha.joshi@gujarat.in',
    state: 'Gujarat',
    district: 'Ahmedabad',
    city: 'Satellite',
    totalPoints: 1150,
    ecoScore: 85,
    baselineAnnualCO2Kg: 2050,
    currentStreakDays: 8,
  },
  {
    fullName: 'Divya Kothari',
    email: 'divya.kothari@gujarat.in',
    state: 'Gujarat',
    district: 'Ahmedabad',
    city: 'Bodakdev',
    totalPoints: 990,
    ecoScore: 84,
    baselineAnnualCO2Kg: 2280,
    currentStreakDays: 7,
  },
  {
    fullName: 'Vikram Parikh',
    email: 'vikram.parikh@gujarat.in',
    state: 'Gujarat',
    district: 'Ahmedabad',
    city: 'Navrangpura',
    totalPoints: 940,
    ecoScore: 82,
    baselineAnnualCO2Kg: 2390,
    currentStreakDays: 6,
  },
  {
    fullName: 'Meera Trivedi',
    email: 'meera.trivedi@gujarat.in',
    state: 'Gujarat',
    district: 'Ahmedabad',
    city: 'Bopal',
    totalPoints: 880,
    ecoScore: 79,
    baselineAnnualCO2Kg: 2490,
    currentStreakDays: 5,
  },
  {
    fullName: 'Kunal Raval',
    email: 'kunal.raval@gujarat.in',
    state: 'Gujarat',
    district: 'Ahmedabad',
    city: 'Maninagar',
    totalPoints: 820,
    ecoScore: 78,
    baselineAnnualCO2Kg: 2610,
    currentStreakDays: 5,
  },
  {
    fullName: 'Tanvi Mistri',
    email: 'tanvi.mistri@gujarat.in',
    state: 'Gujarat',
    district: 'Ahmedabad',
    city: 'Chandkheda',
    totalPoints: 760,
    ecoScore: 75,
    baselineAnnualCO2Kg: 2750,
    currentStreakDays: 4,
  },
  {
    fullName: 'Devansh Solanki',
    email: 'devansh.solanki@gujarat.in',
    state: 'Gujarat',
    district: 'Ahmedabad',
    city: 'Ghatlodia',
    totalPoints: 710,
    ecoScore: 74,
    baselineAnnualCO2Kg: 2840,
    currentStreakDays: 3,
  },

  // Surat District
  {
    fullName: 'Kavita Desai',
    email: 'kavita.desai@gujarat.in',
    state: 'Gujarat',
    district: 'Surat',
    city: 'Adajan',
    totalPoints: 2100,
    ecoScore: 98,
    baselineAnnualCO2Kg: 1320,
    currentStreakDays: 21,
  },
  {
    fullName: 'Bhavik Patel',
    email: 'bhavik.patel@gujarat.in',
    state: 'Gujarat',
    district: 'Surat',
    city: 'Vesu',
    totalPoints: 1720,
    ecoScore: 92,
    baselineAnnualCO2Kg: 1650,
    currentStreakDays: 15,
  },

  // Vadodara District
  {
    fullName: 'Ananya Vyas',
    email: 'ananya.vyas@gujarat.in',
    state: 'Gujarat',
    district: 'Vadodara',
    city: 'Alkapuri',
    totalPoints: 1640,
    ecoScore: 90,
    baselineAnnualCO2Kg: 1720,
    currentStreakDays: 13,
  },

  // Gandhinagar District
  {
    fullName: 'Hardik Bhatt',
    email: 'hardik.bhatt@gujarat.in',
    state: 'Gujarat',
    district: 'Gandhinagar',
    city: 'Infocity',
    totalPoints: 1580,
    ecoScore: 89,
    baselineAnnualCO2Kg: 1810,
    currentStreakDays: 12,
  },
];

async function seedLeaderboard() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to Atlas.\n');

    const User = require('../models/User');
    const defaultPasswordHash = await bcrypt.hash('EcoPulse2026!', 10);

    let createdCount = 0;
    let updatedCount = 0;

    for (const seed of SEED_USERS) {
      const existing = await User.findOne({ email: seed.email });
      if (!existing) {
        await User.create({
          ...seed,
          password: defaultPasswordHash,
          onboardingCompleted: true,
          role: 'citizen',
        });
        createdCount++;
      } else {
        await User.updateOne({ _id: existing._id }, { $set: seed });
        updatedCount++;
      }
    }

    console.log(`✅ Seed Finished: Created ${createdCount} users, updated ${updatedCount} users.`);
    console.log(`🌿 Leaderboard now fully populated across Ahmedabad, Surat, Vadodara & Gandhinagar!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Error:', err.message);
    process.exit(1);
  }
}

seedLeaderboard();
