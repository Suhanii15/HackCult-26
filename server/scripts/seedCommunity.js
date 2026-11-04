const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CommunityPost = require('../models/CommunityPost');
const User = require('../models/User');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SEED_POSTS = [
  {
    title: 'Switched our entire society terrace to solar!',
    content: 'Our residential complex in Gandhinagar just finished installing a 25kW rooftop solar plant under the PM Surya Ghar scheme. Anticipating 70% electricity savings and zero grid pressure during peak summer afternoons! #GreenEnergy',
    tag: 'Energy',
    likesCount: 14,
    celebratesCount: 8,
  },
  {
    title: 'Drip irrigation installed for our community garden',
    content: 'We set up automated drip lines for 45 household garden plots in Rajkot. Cut our water consumption from 800L/day to under 250L/day. Even tomatoes are blooming happier! 🍅💧',
    tag: 'Water',
    likesCount: 22,
    celebratesCount: 12,
  },
  {
    title: 'Zero Single-Use Plastic Month Success!',
    content: 'Carried cotton tote bags and copper water bottles everywhere throughout October across Vadodara markets. Over 120 single-use plastic wrappers avoided individually! Small habits create massive collective momentum.',
    tag: 'Waste',
    likesCount: 31,
    celebratesCount: 19,
  },
  {
    title: 'Daily Metro commute beating city congestion',
    content: 'Clocked my 20th consecutive day using the Ahmedabad Metro instead of a private petrol car. Saved over 45 kg of CO2 emissions this month and avoided all the SG Highway rush hour jams! 🚆🌿',
    tag: 'Transport',
    likesCount: 19,
    celebratesCount: 7,
  },
];

async function seedCommunityPosts({ log = console.log } = {}) {
  const existingCount = await CommunityPost.countDocuments();
  if (existingCount > 0) {
    log(`ℹ️  Community posts already present (${existingCount} posts). Skipping seed.`);
    return { count: existingCount, seeded: false };
  }

  // Find or create an ambassador user to attribute initial seed posts
  let ambassador = await User.findOne({ role: 'admin' });
  if (!ambassador) {
    ambassador = await User.findOne();
  }
  if (!ambassador) {
    ambassador = await User.create({
      fullName: 'Mission LiFE Ambassador',
      email: 'ambassador@ecopulse.gujarat.gov.in',
      password: 'MissionLifePass2026!',
      role: 'citizen',
      district: 'Gandhinagar',
      isEmailVerified: true,
    });
  }

  const postsToInsert = SEED_POSTS.map((p, idx) => ({
    userId: ambassador._id,
    authorName: ambassador.fullName || 'Eco Citizen',
    authorDistrict: ambassador.district || 'Gandhinagar',
    authorAvatar: ambassador.avatar || '',
    title: p.title,
    content: p.content,
    tag: p.tag,
    likesCount: p.likesCount,
    celebratesCount: p.celebratesCount,
    status: 'active',
    createdAt: new Date(Date.now() - (SEED_POSTS.length - idx) * 3600 * 1000 * 6),
  }));

  await CommunityPost.insertMany(postsToInsert);
  log(`🌱 Seeded ${postsToInsert.length} initial Community posts attributed to ${ambassador.fullName}.`);
  return { count: postsToInsert.length, seeded: true };
}

module.exports = { seedCommunityPosts };

if (require.main === module) {
  (async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mission-life';
    await mongoose.connect(uri);
    await seedCommunityPosts();
    await mongoose.disconnect();
  })().catch((err) => {
    console.error('Community seeding error:', err);
    process.exit(1);
  });
}
