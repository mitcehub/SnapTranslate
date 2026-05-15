import { createHash, createSign } from 'crypto';
import { readFileSync, writeFileSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

async function packCRX() {
  const sourceDir = resolve(rootDir, process.argv[2] || 'Translate');
  const outputFile = resolve(rootDir, process.argv[3] || 'EZ-Translate.crx');
  const pemFile = resolve(rootDir, 'Translate.pem');

  if (!statSync(sourceDir).isDirectory()) {
    console.error(`Source directory not found: ${sourceDir}`);
    process.exit(1);
  }

  if (!statSync(pemFile).isFile()) {
    console.error(`PEM key file not found: ${pemFile}`);
    process.exit(1);
  }

  const zipPath = resolve(rootDir, '_temp-build.zip');

  // Create zip using node's built-in zip support (via archiver)
  const { execSync } = await import('child_process');
  
  // Try to use system zip command
  try {
    execSync(`zip -r "${zipPath}" .`, { cwd: sourceDir });
  } catch (e) {
    console.error('Failed to create zip. Install zip command or use node archiver.');
    process.exit(1);
  }

  const zipData = readFileSync(zipPath);
  const pemData = readFileSync(pemFile);

  // Calculate SHA256 hash of zip
  const hash = createHash('sha256');
  hash.update(zipData);
  const hashBuffer = hash.digest();

  // Sign with RSA-SHA256
  const sign = createSign('RSA-SHA256');
  sign.update(zipData);
  const signature = sign.sign(pemData);

  // Write CRX file
  const crxHeader = Buffer.alloc(16);
  crxHeader.write('Cr24', 0); // Magic number
  crxHeader.writeUInt32LE(2, 4); // CRX version 2
  crxHeader.writeUInt32LE(pemData.length, 8); // Public key length
  crxHeader.writeUInt32LE(signature.length, 12); // Signature length

  const crxBuffer = Buffer.concat([
    crxHeader,
    pemData,
    signature,
    zipData
  ]);

  writeFileSync(outputFile, crxBuffer);
  console.log(`✓ CRX package created: ${outputFile}`);

  // Cleanup
  try {
    execSync(`rm "${zipPath}"`);
  } catch {}
}

packCRX().catch(console.error);
