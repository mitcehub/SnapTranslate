import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { generateKeyPairSync, sign } from 'crypto';
import { deflateSync } from 'zlib';

function walkDir(dir, base) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) files.push(...walkDir(full, base));
    else files.push(relative(base, full).replace(/\\/g, '/'));
  }
  return files;
}

function makeZip(extDir) {
  const base = extDir;
  const entries = [];
  for (const rel of walkDir(extDir, base)) {
    const data = readFileSync(join(base, rel));
    const compressed = deflateSync(data);
    const useStored = compressed.length >= data.length;
    const fileData = useStored ? data : compressed;
    entries.push({ name: rel, data: fileData, original: data.length, compressed: fileData.length, method: useStored ? 0 : 8, crc32: crc32Buf(data) });
  }
  const parts = []; const offsets = []; let offset = 0;
  for (const e of entries) {
    const nameBuf = Buffer.from(e.name, 'utf8');
    const local = Buffer.alloc(30 + nameBuf.length + e.data.length);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0, 6);
    local.writeUInt16LE(e.method, 8); local.writeUInt16LE(0, 10); local.writeUInt16LE(0, 12);
    local.writeUInt32LE(e.crc32, 14);
    local.writeUInt32LE(e.compressed, 18); local.writeUInt32LE(e.original, 22);
    local.writeUInt16LE(nameBuf.length, 26); local.writeUInt16LE(0, 28);
    nameBuf.copy(local, 30); e.data.copy(local, 30 + nameBuf.length);
    offsets.push(offset); parts.push(local); offset += local.length;
  }
  const cdParts = []; let cdSize = 0;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i]; const nameBuf = Buffer.from(e.name, 'utf8');
    const cd = Buffer.alloc(46 + nameBuf.length);
    cd.writeUInt32LE(0x02014b50, 0); cd.writeUInt16LE(20, 4); cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0, 8); cd.writeUInt16LE(e.method, 10); cd.writeUInt16LE(0, 12); cd.writeUInt16LE(0, 14);
    cd.writeUInt32LE(e.crc32, 16); cd.writeUInt32LE(e.compressed, 20); cd.writeUInt32LE(e.original, 24);
    cd.writeUInt16LE(nameBuf.length, 28); cd.writeUInt16LE(0, 30); cd.writeUInt16LE(0, 32);
    cd.writeUInt16LE(0, 34); cd.writeUInt32LE(0, 38); cd.writeUInt32LE(offsets[i], 42);
    nameBuf.copy(cd, 46); cdParts.push(cd); cdSize += cd.length;
  }
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); eocd.writeUInt16LE(0, 4); eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8); eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cdSize, 12); eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, ...cdParts, eocd]);
}

const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) { let c = i; for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1); CRC_TABLE[i] = c; }
function crc32Buf(buf) { let crc = 0xffffffff; for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8); return (crc ^ 0xffffffff) >>> 0; }

function encodeVarint(n) { const bytes = []; do { let b = n & 0x7f; n >>>= 7; if (n) b |= 0x80; bytes.push(b); } while (n); return Buffer.from(bytes); }
function varintField(f, v) { return Buffer.concat([encodeVarint((f << 3) | 0), encodeVarint(v)]); }
function bytesField(f, d) { return Buffer.concat([encodeVarint((f << 3) | 2), encodeVarint(d.length), d]); }

const extDir = process.argv[2] || 'Translate';
const outFile = process.argv[3] || 'ez-translate.crx';
const zipData = makeZip(extDir);

const { publicKey: pubDer, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'der' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

// AsymmetricKeyProof: field1=public_key(bytes), field2=signature_type(varint,RSA2=1), field3=signature(bytes)
const proofNoSig = Buffer.concat([bytesField(1, pubDer), varintField(2, 1)]);
// Crx3FileHeader: field10000=proof(bytes), field10001=public_key(bytes)
const headerNoSig = Buffer.concat([bytesField(10000, proofNoSig), bytesField(10001, pubDer)]);

const sig = sign('sha256', Buffer.concat([headerNoSig, zipData]), privateKey);

const proofWithSig = Buffer.concat([bytesField(1, pubDer), varintField(2, 1), bytesField(3, sig)]);
const headerWithSig = Buffer.concat([bytesField(10000, proofWithSig), bytesField(10001, pubDer)]);

const magic = Buffer.from('Cr24');
const ver = Buffer.alloc(4); ver.writeUInt32LE(3);
const hLen = Buffer.alloc(4); hLen.writeUInt32LE(headerWithSig.length);

const crx = Buffer.concat([magic, ver, hLen, headerWithSig, zipData]);
writeFileSync(outFile, crx);
console.log(`Created ${outFile} (${(crx.length / 1024).toFixed(1)} KB)`);
