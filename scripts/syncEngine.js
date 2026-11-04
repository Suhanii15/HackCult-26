const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const sharedDir = path.join(repoRoot, 'shared');
const clientSrcDir = path.join(repoRoot, 'client', 'src');

// Shared modules mirrored into the client (relative to shared/ and client/src/)
const filesToSync = [
  'engine/config.json',
  'engine/footprintEngine.js',
  'activities/activityCatalog.js',
  'activities/questionnaires.js',
  'activities/recommendationEngine.js',
];

console.log('🔄 Syncing shared modules to client/src ...');

for (const file of filesToSync) {
  const src = path.join(sharedDir, file);
  const dest = path.join(clientSrcDir, file);

  if (!fs.existsSync(src)) {
    console.error(`  ✗ Source file missing: ${src}`);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`  ✓ Copied ${file}`);
}

console.log('✅ Sync complete.');
