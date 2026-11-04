const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    console.warn(
      '\n⚠️  [MongoDB Warning] MONGODB_URI is missing or still has placeholder values.' +
        '\nLocal dev: run "npm run dev:db" (embedded MongoDB) in a second terminal, or set a MongoDB Atlas URI in server/.env.\n'
    );
    return;
  }

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(
      `❌ MongoDB Connection Error: ${error.message}` +
        '\n   Is MongoDB running? Start it with "npm run dev:db" (server folder) or fix MONGODB_URI in server/.env.'
    );
    // Do not exit process in development to allow server to still serve non-DB health checks
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
