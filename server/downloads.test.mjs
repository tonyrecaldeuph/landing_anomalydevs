// @vitest-environment node
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { crc32, inflateRawSync } from 'node:zlib';
import { describe, it, expect } from 'vitest';
import { parseLatestYml, writeZip, zipFileName } from './downloads.mjs';

const FEED_YML = `version: 2.1.5
files:
  - url: Terminal de Cobranza Setup 2.1.5.exe
    sha512: 3kP81TQDOfejPy60Hz8ozFckwedcufdDfcCps7H8ufs5sIvaXPi2rlzUyvK3zZ8SlzxXHCYn0cb2lvw5+/hQ4Q==
    size: 97585146
path: Terminal de Cobranza Setup 2.1.5.exe
sha512: 3kP81TQDOfejPy60Hz8ozFckwedcufdDfcCps7H8ufs5sIvaXPi2rlzUyvK3zZ8SlzxXHCYn0cb2lvw5+/hQ4Q==
releaseDate: '2026-07-18T18:35:40.208Z'
`;

/** Minimal single-entry ZIP reader: EOCD → central directory → local header → inflate. */
function readSingleEntryZip(buf) {
  const eocd = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  const cdOffset = buf.readUInt32LE(eocd + 16);
  expect(buf.readUInt32LE(cdOffset)).toBe(0x02014b50);
  const crc = buf.readUInt32LE(cdOffset + 16);
  const compressedSize = buf.readUInt32LE(cdOffset + 20);
  const size = buf.readUInt32LE(cdOffset + 24);
  const nameLen = buf.readUInt16LE(cdOffset + 28);
  const name = buf.subarray(cdOffset + 46, cdOffset + 46 + nameLen).toString('utf8');
  const localOffset = buf.readUInt32LE(cdOffset + 42);
  expect(buf.readUInt32LE(localOffset)).toBe(0x04034b50);
  const localNameLen = buf.readUInt16LE(localOffset + 26);
  const localExtraLen = buf.readUInt16LE(localOffset + 28);
  const dataStart = localOffset + 30 + localNameLen + localExtraLen;
  const data = inflateRawSync(buf.subarray(dataStart, dataStart + compressedSize));
  return { name, crc, size, data };
}

describe('parseLatestYml', () => {
  it('reads version, installer path, integrity and size from the electron-updater feed', () => {
    expect(parseLatestYml(FEED_YML)).toEqual({
      ok: true,
      version: '2.1.5',
      path: 'Terminal de Cobranza Setup 2.1.5.exe',
      sha512: '3kP81TQDOfejPy60Hz8ozFckwedcufdDfcCps7H8ufs5sIvaXPi2rlzUyvK3zZ8SlzxXHCYn0cb2lvw5+/hQ4Q==',
      size: 97585146,
      releaseDate: '2026-07-18T18:35:40.208Z',
    });
  });

  it('rejects an empty or incomplete manifest with a reason instead of partial data', () => {
    expect(parseLatestYml('').ok).toBe(false);
    expect(parseLatestYml('version: 1.0.0\n').ok).toBe(false);
    expect(parseLatestYml(FEED_YML.replace(/^sha512:.*$/m, '')).ok).toBe(false);
  });

  it('rejects installer paths that try to escape the feed directory', () => {
    expect(parseLatestYml(FEED_YML.replace(/^path: .*$/m, 'path: ../../etc/passwd')).ok).toBe(false);
  });
});

describe('zipFileName', () => {
  it('names the archive after the product and version', () => {
    expect(zipFileName('2.1.5')).toBe('Terminal-Cobranza-v2.1.5.zip');
  });
});

describe('writeZip', () => {
  it('produces a standard ZIP whose single entry inflates back to the original bytes', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'zip-'));
    const src = path.join(dir, 'setup.exe');
    const out = path.join(dir, 'out.zip');
    // Half random, half repetitive: exercises both incompressible and compressible data.
    const original = Buffer.concat([randomBytes(150_000), Buffer.alloc(150_000, 7)]);
    await writeFile(src, original);

    const { size } = await writeZip(src, 'Terminal de Cobranza Setup 2.1.5.exe', out);

    const zip = await readFile(out);
    expect(size).toBe(zip.length);
    expect(zip.length).toBeLessThan(original.length);
    const entry = readSingleEntryZip(zip);
    expect(entry.name).toBe('Terminal de Cobranza Setup 2.1.5.exe');
    expect(entry.size).toBe(original.length);
    expect(entry.crc).toBe(crc32(original));
    expect(entry.data.equals(original)).toBe(true);
  });
});
