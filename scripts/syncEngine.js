const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const sharedEngineDir = path.join(repoRoot, 'shared', 'engine');
const clientEngineDir = path.join(repoRoot, 'client', 'src', 'engine');

const filesToSync = ['config.json', 'footprintEngine.js'];

console.log('🔄 Syncing engine from shared/engine to client/src/engine...');

if (!fs.existsSync(clientEngineDir)) {
  fs.mkdirSync(clientEngineDir, { recursive: true });
}

for (const file of filesToSync) {
  const src = path.join(sharedEngineDir, file);
  const dest = path.join(clientEngineDir, file);

  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`  ✓ Copied ${file}`);
  } else {
    console.error(`  ✗ Source file missing: ${src}`);
    process.exit(1);
  }
}

console.log('✅ Engine sync complete.');
