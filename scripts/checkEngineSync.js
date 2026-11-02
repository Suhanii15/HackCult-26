const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const sharedEngineDir = path.join(repoRoot, 'shared', 'engine');
const clientEngineDir = path.join(repoRoot, 'client', 'src', 'engine');

const filesToCompare = ['config.json', 'footprintEngine.js'];

let hasDiff = false;

for (const file of filesToCompare) {
  const sharedFile = path.join(sharedEngineDir, file);
  const clientFile = path.join(clientEngineDir, file);

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
    console.error(`❌ Mismatch detected in ${file} between shared/engine and client/src/engine!`);
    console.error(`Run "npm run sync:engine" to sync shared engine to client.`);
    hasDiff = true;
  } else {
    console.log(`✓ ${file} is in sync.`);
  }
}

if (hasDiff) {
  process.exit(1);
} else {
  console.log('✅ shared/engine and client/src/engine are perfectly identical.');
  process.exit(0);
}
