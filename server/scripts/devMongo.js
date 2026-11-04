/**
 * Local development MongoDB (no installation or Docker needed).
 * Runs an embedded MongoDB on 127.0.0.1:27017 with data persisted in server/.data/mongo.
 *
 *   npm run dev:db      (keep this terminal open)
 *   npm run dev         (in another terminal)
 *
 * For production/shared use, point MONGODB_URI at MongoDB Atlas instead.
 */
const fs = require('fs');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

const PORT = Number(process.env.DEV_DB_PORT || 27017);
const dbPath = path.resolve(__dirname, '../.data/mongo');

(async () => {
  fs.mkdirSync(dbPath, { recursive: true });
  const mongod = await MongoMemoryServer.create({
    instance: { port: PORT, ip: '127.0.0.1', dbPath, storageEngine: 'wiredTiger' },
  });
  console.log(`🍃 Embedded MongoDB running: ${mongod.getUri()}`);
  console.log(`   Data directory: ${dbPath}`);
  console.log('   Use MONGODB_URI=mongodb://127.0.0.1:' + PORT + '/mission-life  (already set in server/.env)');

  const stop = async () => {
    await mongod.stop();
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
})().catch((err) => {
  console.error('Failed to start embedded MongoDB:', err.message);
  process.exit(1);
});
