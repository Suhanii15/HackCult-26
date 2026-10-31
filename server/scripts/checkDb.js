const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkDatabase() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!\n');

    const User = require('../models/User');
    const FootprintLog = require('../models/FootprintLog');

    const users = await User.find(
      {},
      'fullName email district city totalPoints baselineAnnualCO2Kg badgesEarned createdAt'
    );
    const logs = await FootprintLog.find(
      {},
      'userId periodType totalMonthlyCO2Kg annualCO2Kg breakdown createdAt'
    );

    console.log(`===============================================`);
    console.log(`👤 REGISTERED USERS (${users.length})`);
    console.log(`===============================================`);
    users.forEach((u, i) => {
      console.log(`[${i + 1}] ${u.fullName} (${u.email})`);
      console.log(`    - ID: ${u._id}`);
      console.log(`    - Location: ${u.city}, ${u.district}`);
      console.log(`    - Total Green Points: ⭐ ${u.totalPoints}`);
      console.log(`    - Baseline Annual CO₂: 🌿 ${u.baselineAnnualCO2Kg} kg`);
      console.log(`    - Badges Earned: ${u.badgesEarned?.map((b) => b.badgeName).join(', ') || 'None'}`);
      console.log(`    - Registered: ${new Date(u.createdAt).toLocaleString()}\n`);
    });

    console.log(`===============================================`);
    console.log(`📊 FOOTPRINT LOGS (${logs.length})`);
    console.log(`===============================================`);
    logs.forEach((log, i) => {
      console.log(`[${i + 1}] Log ID: ${log._id}`);
      console.log(`    - User ID: ${log.userId}`);
      console.log(`    - Type: ${log.periodType}`);
      console.log(`    - Monthly CO₂: ${log.totalMonthlyCO2Kg} kg/mo`);
      console.log(`    - Annual CO₂: ${log.annualCO2Kg} kg/yr`);
      console.log(`    - Breakdown:`);
      console.log(`        • Electricity: ${log.breakdown?.electricity?.kg || 0} kg`);
      console.log(`        • Cooking:     ${log.breakdown?.cooking?.kg || 0} kg`);
      console.log(`        • Transport:   ${log.breakdown?.transport?.kg || 0} kg`);
      console.log(`    - Created: ${new Date(log.createdAt).toLocaleString()}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error querying database:', error.message);
    process.exit(1);
  }
}

checkDatabase();
