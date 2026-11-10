import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, r, g, b) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(2, 9); // color type (truecolor RGB)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data: height rows, each width * 3 bytes + 1 filter byte (0)
  const rowSize = width * 3 + 1;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      // Draw outer background dark navy (10, 15, 30), inner glow cyan/pink
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxR = width * 0.45;

      if (dist < maxR * 0.4) {
        // Core Cyan
        rawData[pxOffset] = 34;
        rawData[pxOffset + 1] = 211;
        rawData[pxOffset + 2] = 238;
      } else if (dist < maxR * 0.75) {
        // Pink ring
        rawData[pxOffset] = 236;
        rawData[pxOffset + 1] = 72;
        rawData[pxOffset + 2] = 153;
      } else if (dist < maxR) {
        // Neon Purple ring
        rawData[pxOffset] = 168;
        rawData[pxOffset + 1] = 85;
        rawData[pxOffset + 2] = 247;
      } else {
        // Dark Navy background
        rawData[pxOffset] = 10;
        rawData[pxOffset + 1] = 15;
        rawData[pxOffset + 2] = 30;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crcBuf = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crcVal = crc32(crcBuf);
  buf.writeUInt32BE(crcVal, 8 + len);

  return buf;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180));
console.log('Successfully generated PWA PNG icons!');
