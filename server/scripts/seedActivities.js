const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Activity = require('../models/Activity');
const { ACTIVITY_CATALOG } = require('../../shared/activities/activityCatalog');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Idempotently upserts the whole catalogue by activityId.
 * Never deletes anything: existing activities keep their _id (so user cycles stay linked),
 * and activities that are not in the catalogue are left untouched.
 */
async function seedActivities({ log = console.log } = {}) {
  const ops = ACTIVITY_CATALOG.map((act) => ({
    updateOne: {
      filter: { activityId: act.activityId },
      update: { $set: act },
      upsert: true,
    },
  }));
  const result = await Activity.bulkWrite(ops, { ordered: false });
  const summary = ACTIVITY_CATALOG.reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1;
    return acc;
  }, {});
  log(
    `🌱 Activity catalogue synced: ${ACTIVITY_CATALOG.length} activities ` +
      `(${result.upsertedCount} new, ${result.modifiedCount} updated) ` +
      Object.entries(summary).map(([k, v]) => `${k}=${v}`).join(' ')
  );
  return { total: ACTIVITY_CATALOG.length, ...result };
}

module.exports = { seedActivities };

// CLI usage: node scripts/seedActivities.js
if (require.main === module) {
  (async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('Missing MONGODB_URI (set it in server/.env)');
      process.exit(1);
    }
    await mongoose.connect(uri);
    console.log('Connected to MongoDB. Seeding activities...');
    await seedActivities();
    await mongoose.disconnect();
  })().catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
}
