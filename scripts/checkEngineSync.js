const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const sharedDir = path.join(repoRoot, 'shared');
const clientSrcDir = path.join(repoRoot, 'client', 'src');

const filesToCompare = [
  'engine/config.json',
  'engine/footprintEngine.js',
  'activities/activityCatalog.js',
  'activities/questionnaires.js',
  'activities/recommendationEngine.js',
];

let hasDiff = false;

for (const file of filesToCompare) {
  const sharedFile = path.join(sharedDir, file);
  const clientFile = path.join(clientSrcDir, file);

  if (!fs.existsSync(sharedFile)) {
    console.error(`✗ Missing shared file: ${sharedFile}`);
    process.exit(1);
  }
  if (!fs.existsSync(clientFile)) {
    console.error(`✗ Missing client file: ${clientFile}`);
    process.exit(1);
  }

  // Normalize CRLF to LF for comparison so platform line endings don't cause false positives
  const sharedContent = fs.readFileSync(sharedFile, 'utf8').replace(/\r\n/g, '\n').trim();
  const clientContent = fs.readFileSync(clientFile, 'utf8').replace(/\r\n/g, '\n').trim();

  if (sharedContent !== clientContent) {
    console.error(`❌ Mismatch detected in ${file} between shared and client/src!`);
    console.error(`Run "npm run sync:engine" to sync shared files to the client.`);
    hasDiff = true;
  } else {
    console.log(`✓ ${file} is in sync.`);
  }
}

if (hasDiff) {
  process.exit(1);
} else {
  console.log('✅ shared and client/src copies are perfectly identical.');
  process.exit(0);
}
