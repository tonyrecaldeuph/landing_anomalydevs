import { createReadStream, createWriteStream } from 'node:fs';
import { once } from 'node:events';
import { crc32, createDeflateRaw, constants as zlibConstants } from 'node:zlib';

const PRODUCT_SLUG = 'Terminal-Cobranza';

// ---------------------------------------------------------------------------
// Feed manifest (electron-updater latest.yml)
// ---------------------------------------------------------------------------

/**
 * Reads the fields we need from an electron-updater `latest.yml`. The format is flat
 * enough that a line parser beats pulling in a YAML dependency. Returns a Special Case
 * `{ ok: false, reason }` instead of partial data when anything required is missing.
 */
export function parseLatestYml(text) {
  const top = (key) => {
    const match = new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(text ?? '');
    return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : '';
  };
  const version = top('version');
  const installerPath = top('path');
  const sha512 = top('sha512');
  const releaseDate = top('releaseDate');
  const sizeMatch = /^\s+size:\s*(\d+)\s*$/m.exec(text ?? '');
  const size = sizeMatch ? Number(sizeMatch[1]) : 0;

  if (!version || !installerPath || !sha512 || !size) {
    return { ok: false, reason: 'latest.yml incompleto' };
  }
  if (installerPath.includes('/') || installerPath.includes('\\') || installerPath.includes('..')) {
    return { ok: false, reason: 'ruta de instalador inválida' };
  }
  return { ok: true, version, path: installerPath, sha512, size, releaseDate };
}

export function zipFileName(version) {
  return `${PRODUCT_SLUG}-v${version}.zip`;
}

// ---------------------------------------------------------------------------
// Streaming single-entry ZIP writer
// ---------------------------------------------------------------------------

const SIG_LOCAL = 0x04034b50;
const SIG_DESCRIPTOR = 0x08074b50;
const SIG_CENTRAL = 0x02014b50;
const SIG_EOCD = 0x06054b50;
const VERSION_NEEDED = 20;
/** Bit 3: sizes/CRC follow the data (we stream); bit 11: UTF-8 file name. */
const FLAGS = 0x0008 | 0x0800;
const METHOD_DEFLATE = 8;

function dosDateTime(date) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

/**
 * Compresses one file into a standard ZIP without buffering it: memory stays constant
 * whatever the installer size. Sizes and CRC go in a data descriptor after the payload.
 */
export async function writeZip(srcPath, entryName, outPath) {
  const name = Buffer.from(entryName, 'utf8');
  const { time, day } = dosDateTime(new Date());
  const out = createWriteStream(outPath);
  let written = 0;
  const write = async (buf) => {
    written += buf.length;
    if (!out.write(buf)) await once(out, 'drain');
  };

  const local = Buffer.alloc(30);
  local.writeUInt32LE(SIG_LOCAL, 0);
  local.writeUInt16LE(VERSION_NEEDED, 4);
  local.writeUInt16LE(FLAGS, 6);
  local.writeUInt16LE(METHOD_DEFLATE, 8);
  local.writeUInt16LE(time, 10);
  local.writeUInt16LE(day, 12);
  local.writeUInt16LE(name.length, 26);
  await write(local);
  await write(name);

  let crc = 0;
  let uncompressed = 0;
  let compressed = 0;
  const deflate = createDeflateRaw({ level: zlibConstants.Z_BEST_COMPRESSION });
  const source = createReadStream(srcPath);
  source.on('data', (chunk) => {
    crc = crc32(chunk, crc);
    uncompressed += chunk.length;
  });
  source.on('error', (err) => deflate.destroy(err));
  source.pipe(deflate);
  for await (const chunk of deflate) {
    compressed += chunk.length;
    await write(chunk);
  }

  const descriptor = Buffer.alloc(16);
  descriptor.writeUInt32LE(SIG_DESCRIPTOR, 0);
  descriptor.writeUInt32LE(crc >>> 0, 4);
  descriptor.writeUInt32LE(compressed, 8);
  descriptor.writeUInt32LE(uncompressed, 12);
  await write(descriptor);

  const centralOffset = written;
  const central = Buffer.alloc(46);
  central.writeUInt32LE(SIG_CENTRAL, 0);
  central.writeUInt16LE(VERSION_NEEDED, 4);
  central.writeUInt16LE(VERSION_NEEDED, 6);
  central.writeUInt16LE(FLAGS, 8);
  central.writeUInt16LE(METHOD_DEFLATE, 10);
  central.writeUInt16LE(time, 12);
  central.writeUInt16LE(day, 14);
  central.writeUInt32LE(crc >>> 0, 16);
  central.writeUInt32LE(compressed, 20);
  central.writeUInt32LE(uncompressed, 24);
  central.writeUInt16LE(name.length, 28);
  central.writeUInt32LE(0, 42); // local header offset: the only entry starts the file
  await write(central);
  await write(name);

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(SIG_EOCD, 0);
  eocd.writeUInt16LE(1, 8);
  eocd.writeUInt16LE(1, 10);
  eocd.writeUInt32LE(46 + name.length, 12);
  eocd.writeUInt32LE(centralOffset, 16);
  await write(eocd);

  out.end();
  await once(out, 'finish');
  return { size: written };
}
