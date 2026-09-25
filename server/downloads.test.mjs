// @vitest-environment node
import { createServer } from 'node:http';
import { mkdtemp, readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash, randomBytes } from 'node:crypto';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { crc32, inflateRawSync } from 'node:zlib';
import { describe, it, expect, vi } from 'vitest';
import {
  parseLatestYml,
  writeZip,
  zipFileName,
  createInstallerMirror,
  createDownloadRoutes,
} from './downloads.mjs';
import { createApp, createRateLimiter } from './index.mjs';

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

// ---------------------------------------------------------------------------
// Mirror
// ---------------------------------------------------------------------------

const FEED = 'https://feed.test/updates/';
const silent = { error: () => {}, log: () => {} };

function feedFor(version, installer) {
  const sha512 = createHash('sha512').update(installer).digest('base64');
  const name = `Terminal de Cobranza Setup ${version}.exe`;
  const yml = [
    `version: ${version}`,
    'files:',
    `  - url: ${name}`,
    `    sha512: ${sha512}`,
    `    size: ${installer.length}`,
    `path: ${name}`,
    `sha512: ${sha512}`,
    "releaseDate: '2026-09-25T10:00:00.000Z'",
    '',
  ].join('\n');
  return { yml, name };
}

/** Fake feed: serves latest.yml and the installer bytes, counting installer downloads. */
function fakeFetch(state) {
  return vi.fn(async (url) => {
    const u = String(url);
    if (u === `${FEED}latest.yml`) return new Response(state.yml);
    if (u === `${FEED}${encodeURIComponent(state.name)}`) {
      state.installerHits = (state.installerHits ?? 0) + 1;
      return new Response(state.served ?? state.installer);
    }
    return new Response('nope', { status: 404 });
  });
}

async function newMirror(state) {
  const dataDir = await mkdtemp(path.join(tmpdir(), 'mirror-'));
  const fetchFn = fakeFetch(state);
  return { dataDir, mirror: createInstallerMirror({ feedUrl: FEED, dataDir, fetchFn, logger: silent }) };
}

describe('createInstallerMirror', () => {
  const installer = Buffer.concat([randomBytes(20_000), Buffer.alloc(80_000, 1)]);

  it('starts unavailable, then mirrors the feed version as a verified zip', async () => {
    const state = { ...feedFor('2.1.5', installer), installer };
    const { mirror, dataDir } = await newMirror(state);
    expect(await mirror.current()).toEqual({ available: false });

    expect(await mirror.sync()).toEqual({ changed: true, version: '2.1.5' });

    const current = await mirror.current();
    expect(current).toMatchObject({ available: true, version: '2.1.5', zipFile: 'Terminal-Cobranza-v2.1.5.zip' });
    const zip = await readFile(path.join(dataDir, current.zipFile));
    expect(current.size).toBe(zip.length);
    expect(readSingleEntryZip(zip).data.equals(installer)).toBe(true);
  });

  it('does not download again when the feed version is already mirrored', async () => {
    const state = { ...feedFor('2.1.5', installer), installer };
    const { mirror } = await newMirror(state);
    await mirror.sync();
    expect(await mirror.sync()).toEqual({ changed: false, version: '2.1.5' });
    expect(state.installerHits).toBe(1);
  });

  it('keeps the previous good copy when a new installer fails its sha512 check', async () => {
    const state = { ...feedFor('2.1.5', installer), installer };
    const { mirror, dataDir } = await newMirror(state);
    await mirror.sync();

    const next = Buffer.alloc(50_000, 9);
    Object.assign(state, feedFor('2.1.6', next), { installer: next, served: Buffer.alloc(50_000, 8) });
    expect((await mirror.sync()).changed).toBe(false);

    expect((await mirror.current()).version).toBe('2.1.5');
    const leftovers = (await readdir(dataDir)).filter((f) => f.startsWith('.tmp'));
    expect(leftovers).toEqual([]);
  });

  it('replaces the old zip when a new version is released', async () => {
    const state = { ...feedFor('2.1.5', installer), installer };
    const { mirror, dataDir } = await newMirror(state);
    await mirror.sync();
    const next = Buffer.alloc(40_000, 3);
    Object.assign(state, feedFor('2.1.6', next), { installer: next, served: undefined });

    expect(await mirror.sync()).toEqual({ changed: true, version: '2.1.6' });
    const zips = (await readdir(dataDir)).filter((f) => f.endsWith('.zip'));
    expect(zips).toEqual(['Terminal-Cobranza-v2.1.6.zip']);
  });

  it('collapses concurrent syncs into a single download', async () => {
    const state = { ...feedFor('2.1.5', installer), installer };
    const { mirror } = await newMirror(state);
    await Promise.all([mirror.sync(), mirror.sync(), mirror.sync()]);
    expect(state.installerHits).toBe(1);
  });

  it('pins a local installer: serves it at once under its own version label', async () => {
    const state = { ...feedFor('2.1.5', installer), installer };
    const { mirror, dataDir } = await newMirror(state);
    await mirror.sync();
    const local = Buffer.alloc(60_000, 5);
    const localPath = path.join(dataDir, 'Terminal de Cobranza Setup 3.1.6.exe');
    await writeFile(localPath, local);

    expect(await mirror.pin({ installerPath: localPath, version: '3.1.6' })).toEqual({ ok: true, version: '3.1.6' });

    const current = await mirror.current();
    expect(current).toMatchObject({ available: true, version: '3.1.6', zipFile: 'Terminal-Cobranza-v3.1.6.zip' });
    const entry = readSingleEntryZip(await readFile(path.join(dataDir, current.zipFile)));
    expect(entry.name).toBe('Terminal de Cobranza Setup 3.1.6.exe');
    expect(entry.data.equals(local)).toBe(true);
    const zips = (await readdir(dataDir)).filter((f) => f.endsWith('.zip'));
    expect(zips).toEqual(['Terminal-Cobranza-v3.1.6.zip']);
  });

  it('keeps a pinned installer while the feed still publishes the same build', async () => {
    const state = { ...feedFor('2.1.5', installer), installer };
    const { mirror, dataDir } = await newMirror(state);
    const localPath = path.join(dataDir, 'local.exe');
    await writeFile(localPath, Buffer.alloc(60_000, 5));
    await mirror.pin({ installerPath: localPath, version: '3.1.6' });

    expect(await mirror.sync()).toEqual({ changed: false, version: '3.1.6' });
    expect((await mirror.current()).version).toBe('3.1.6');
    expect(state.installerHits ?? 0).toBe(0);
  });

  it('follows the feed again as soon as it publishes a new build over a pinned one', async () => {
    const state = { ...feedFor('2.1.5', installer), installer };
    const { mirror, dataDir } = await newMirror(state);
    const localPath = path.join(dataDir, 'local.exe');
    await writeFile(localPath, Buffer.alloc(60_000, 5));
    await mirror.pin({ installerPath: localPath, version: '3.1.6' });

    const next = Buffer.alloc(40_000, 3);
    Object.assign(state, feedFor('3.1.7', next), { installer: next });
    expect(await mirror.sync()).toEqual({ changed: true, version: '3.1.7' });
  });

  it('refuses to pin while the feed is unreachable, keeping the current copy', async () => {
    const state = { ...feedFor('2.1.5', installer), installer };
    const { mirror, dataDir } = await newMirror(state);
    await mirror.sync();
    state.yml = 'roto';
    const localPath = path.join(dataDir, 'local.exe');
    await writeFile(localPath, Buffer.alloc(10_000, 5));

    const result = await mirror.pin({ installerPath: localPath, version: '3.1.6' });
    expect(result.ok).toBe(false);
    expect((await mirror.current()).version).toBe('2.1.5');
  });

  it('reports no change instead of throwing when the feed is down', async () => {
    const dataDir = await mkdtemp(path.join(tmpdir(), 'mirror-'));
    const fetchFn = vi.fn(async () => {
      throw new Error('ECONNREFUSED');
    });
    const mirror = createInstallerMirror({ feedUrl: FEED, dataDir, fetchFn, logger: silent });
    expect(await mirror.sync()).toEqual({ changed: false, version: '' });
  });
});

// ---------------------------------------------------------------------------
// HTTP routes
// ---------------------------------------------------------------------------

const TOKEN = 'tok_0123456789abcdefghijklmnopqrstuv';

async function startDownloads({ current, rateLimiter = createRateLimiter({ max: 100 }), token = TOKEN } = {}) {
  const dataDir = await mkdtemp(path.join(tmpdir(), 'routes-'));
  const zipBytes = Buffer.from('PK-fake-zip-bytes');
  await writeFile(path.join(dataDir, 'Terminal-Cobranza-v2.1.5.zip'), zipBytes);
  const available = {
    available: true,
    version: '2.1.5',
    zipFile: 'Terminal-Cobranza-v2.1.5.zip',
    size: zipBytes.length,
    releaseDate: '2026-07-18',
  };
  const mirror = { dataDir, current: async () => current ?? available };
  const downloads = createDownloadRoutes({ mirror, token, rateLimiter });
  const server = createServer(createApp({ dataDir, downloads, logger: silent }));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  return { url, zipBytes, close: () => new Promise((r) => server.close(r)) };
}

describe('download routes', () => {
  it('serves the current zip as an attachment for the right token', async () => {
    const { url, zipBytes, close } = await startDownloads();
    try {
      const res = await fetch(`${url}/descargas/terminal-cobranza/${TOKEN}`);
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('application/zip');
      expect(res.headers.get('content-disposition')).toBe('attachment; filename="Terminal-Cobranza-v2.1.5.zip"');
      expect(res.headers.get('cache-control')).toBe('private, no-store');
      expect(Buffer.from(await res.arrayBuffer()).equals(zipBytes)).toBe(true);
    } finally {
      await close();
    }
  });

  it('answers 404 to a wrong or missing token, hiding that the route exists', async () => {
    const { url, close } = await startDownloads();
    try {
      expect((await fetch(`${url}/descargas/terminal-cobranza/otro-token`)).status).toBe(404);
      expect((await fetch(`${url}/descargas/terminal-cobranza/`)).status).toBe(404);
    } finally {
      await close();
    }
  });

  it('answers HEAD with the headers and no body', async () => {
    const { url, zipBytes, close } = await startDownloads();
    try {
      const res = await fetch(`${url}/descargas/terminal-cobranza/${TOKEN}`, { method: 'HEAD' });
      expect(res.status).toBe(200);
      expect(res.headers.get('content-length')).toBe(String(zipBytes.length));
    } finally {
      await close();
    }
  });

  it('reports the published version as JSON', async () => {
    const { url, close } = await startDownloads();
    try {
      const res = await fetch(`${url}/descargas/terminal-cobranza/${TOKEN}/version`);
      expect(await res.json()).toEqual({ ok: true, version: '2.1.5', releaseDate: '2026-07-18' });
    } finally {
      await close();
    }
  });

  it('answers 503 while no copy has been mirrored yet', async () => {
    const { url, close } = await startDownloads({ current: { available: false } });
    try {
      const res = await fetch(`${url}/descargas/terminal-cobranza/${TOKEN}`);
      expect(res.status).toBe(503);
      expect((await res.json()).ok).toBe(false);
    } finally {
      await close();
    }
  });

  it('rate limits repeated downloads from one IP with 429', async () => {
    const { url, close } = await startDownloads({ rateLimiter: createRateLimiter({ max: 1 }) });
    try {
      expect((await fetch(`${url}/descargas/terminal-cobranza/${TOKEN}`)).status).toBe(200);
      expect((await fetch(`${url}/descargas/terminal-cobranza/${TOKEN}`)).status).toBe(429);
    } finally {
      await close();
    }
  });

  it('does not exist at all when no token is configured', async () => {
    const { url, close } = await startDownloads({ token: '' });
    try {
      expect((await fetch(`${url}/descargas/terminal-cobranza/`)).status).toBe(404);
      expect((await fetch(`${url}/descargas/terminal-cobranza/x`)).status).toBe(404);
    } finally {
      await close();
    }
  });
});
