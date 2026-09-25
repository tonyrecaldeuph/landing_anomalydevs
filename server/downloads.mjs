import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { createHash, timingSafeEqual } from 'node:crypto';
import { once } from 'node:events';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { crc32, createDeflateRaw, constants as zlibConstants } from 'node:zlib';

const PRODUCT_SLUG = 'Terminal-Cobranza';
const DEFAULT_UPDATE_FEED_URL = 'https://api.anomalydevs.qzz.io/updates/';
const MANIFEST_FILE = 'manifest.json';
const ROUTE_RE = /^\/descargas\/terminal-cobranza\/([^/]*)(\/version)?\/?$/;

// ---------------------------------------------------------------------------
// HTTP routes — high level first; mirror, zip and parsing details below.
// ---------------------------------------------------------------------------

/**
 * Routes for the fixed download link. Returns a handler that answers and resolves `true`
 * for any /descargas/terminal-cobranza/* request, `false` for everything else. A wrong
 * token (or none configured) gets the same 404 as an unknown path.
 */
export function createDownloadRoutes({ mirror, token, rateLimiter = () => true, clientIp = () => 'unknown' }) {
  return async function handleDownloads(req, res) {
    const url = req.url?.split('?')[0] ?? '/';
    const match = ROUTE_RE.exec(url);
    if (!url.startsWith('/descargas/')) return false;
    if (!match || !token || !tokensMatch(match[1], token) || (req.method !== 'GET' && req.method !== 'HEAD')) {
      sendJson(res, 404, { ok: false, error: 'Not found' });
      return true;
    }

    const current = await mirror.current();
    if (!current.available) {
      sendJson(res, 503, { ok: false, error: 'La descarga se está preparando. Intenta de nuevo en unos minutos.' });
      return true;
    }
    if (match[2]) {
      sendJson(res, 200, { ok: true, version: current.version, releaseDate: current.releaseDate });
      return true;
    }
    if (req.method === 'GET' && !rateLimiter(clientIp(req))) {
      sendJson(res, 429, { ok: false, error: 'Demasiadas descargas. Intenta de nuevo más tarde.' });
      return true;
    }

    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Length': current.size,
      'Content-Disposition': `attachment; filename="${current.zipFile}"`,
      'Cache-Control': 'private, no-store',
    });
    if (req.method === 'HEAD') {
      res.end();
      return true;
    }
    await pipeline(createReadStream(path.join(mirror.dataDir, current.zipFile)), res).catch(() => res.destroy());
    return true;
  };
}

/** Constant-time comparison; hashing first equalizes lengths so length never leaks either. */
function tokensMatch(given, expected) {
  const a = createHash('sha256').update(given).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) });
  res.end(body);
}

// ---------------------------------------------------------------------------
// Installer mirror
// ---------------------------------------------------------------------------

/** The mirror as configured in the container: shared by the server and the pin command. */
export function mirrorFromEnv(env = process.env) {
  return createInstallerMirror({
    feedUrl: env.UPDATE_FEED_URL || DEFAULT_UPDATE_FEED_URL,
    dataDir: path.join(env.DATA_DIR ?? '/data', 'descargas'),
  });
}

/**
 * Keeps a verified, zipped copy of the installer the update feed currently publishes.
 * The feed stays the single source of truth: releasing there updates the link by itself.
 * Every failure path leaves the previous good copy in place.
 */
export function createInstallerMirror({ feedUrl, dataDir, fetchFn = fetch, logger = console }) {
  let inFlight = null;

  async function current() {
    try {
      const manifest = JSON.parse(await readFile(path.join(dataDir, MANIFEST_FILE), 'utf8'));
      await stat(path.join(dataDir, manifest.zipFile));
      return { available: true, ...manifest };
    } catch {
      return { available: false };
    }
  }

  /**
   * Which feed build the served copy answers to. A copy mirrored from the feed carries its
   * own sha512; a pinned copy records the feed build that was live when it was pinned.
   * Deciding by this hash (not by version number) lets a pin outrank a stale feed without
   * comparing version labels that may not be ordered.
   */
  const feedBuildOf = (manifest) => manifest.feedSha512 ?? manifest.sha512;

  async function runSync() {
    const feed = await readFeed();
    const existing = await current();
    if (!feed.ok) {
      logger.error(`descargas: no se pudo leer el feed: ${feed.reason}`);
      return { changed: false, version: existing.version ?? '' };
    }
    if (existing.available && feedBuildOf(existing) === feed.sha512) {
      return { changed: false, version: existing.version };
    }

    await mkdir(dataDir, { recursive: true });
    const tmpExe = path.join(dataDir, `.tmp-${feed.version}.exe`);
    try {
      await downloadVerified(new URL(encodeURIComponent(feed.path), feedUrl), tmpExe, feed, fetchFn);
      await publish({
        sourcePath: tmpExe,
        entryName: feed.path,
        manifest: { version: feed.version, releaseDate: feed.releaseDate, sha512: feed.sha512, source: 'feed' },
      });
      return { changed: true, version: feed.version };
    } catch (err) {
      logger.error(`descargas: no se pudo espejar ${feed.version}: ${err?.message ?? err}`);
      return { changed: false, version: existing.version ?? '' };
    } finally {
      await rm(tmpExe, { force: true });
    }
  }

  async function runPin({ installerPath, version }) {
    if (!VERSION_RE.test(version)) return { ok: false, reason: `versión inválida: ${version}` };
    // Without the live feed build we could not tell later whether the feed moved on.
    const feed = await readFeed();
    if (!feed.ok) return { ok: false, reason: `feed no disponible: ${feed.reason}` };
    try {
      const sha512 = await sha512OfFile(installerPath);
      await mkdir(dataDir, { recursive: true });
      await publish({
        sourcePath: installerPath,
        entryName: `Terminal de Cobranza Setup ${version}.exe`,
        manifest: { version, releaseDate: new Date().toISOString(), sha512, source: 'manual', feedSha512: feed.sha512 },
      });
      return { ok: true, version };
    } catch (err) {
      return { ok: false, reason: err?.message ?? String(err) };
    }
  }

  async function readFeed() {
    try {
      const res = await fetchFn(new URL('latest.yml', feedUrl));
      if (!res.ok) return { ok: false, reason: `latest.yml HTTP ${res.status}` };
      return parseLatestYml(await res.text());
    } catch (err) {
      return { ok: false, reason: err?.message ?? String(err) };
    }
  }

  /** Zips the installer and swaps it in atomically; the previous copy survives any failure. */
  async function publish({ sourcePath, entryName, manifest }) {
    const zipFile = zipFileName(manifest.version);
    const tmpZip = path.join(dataDir, `.tmp-${zipFile}`);
    try {
      const { size } = await writeZip(sourcePath, entryName, tmpZip);
      await rename(tmpZip, path.join(dataDir, zipFile));
      const tmpManifest = path.join(dataDir, `.tmp-${MANIFEST_FILE}`);
      await writeFile(tmpManifest, JSON.stringify({ ...manifest, zipFile, size }, null, 2));
      await rename(tmpManifest, path.join(dataDir, MANIFEST_FILE));
      await removeStaleZips(dataDir, zipFile);
      logger.log(`descargas: publicada ${zipFile} (${size} bytes, origen ${manifest.source})`);
    } finally {
      await rm(tmpZip, { force: true });
    }
  }

  // Sync and pin both rewrite the served copy: run them one at a time.
  let queue = Promise.resolve();
  const exclusive = (fn) => {
    const run = queue.then(fn, fn);
    queue = run.catch(() => {});
    return run;
  };

  return {
    dataDir,
    current,
    /** Concurrent callers share one run, so a slow download is never duplicated. */
    sync() {
      if (!inFlight) inFlight = exclusive(runSync).finally(() => (inFlight = null));
      return inFlight;
    },
    /** Serves a local installer under `version` until the feed publishes a different build. */
    pin(options) {
      return exclusive(() => runPin(options));
    },
  };
}

const VERSION_RE = /^\d+\.\d+\.\d+$/;

async function sha512OfFile(filePath) {
  const hash = createHash('sha512');
  await pipeline(createReadStream(filePath), hash);
  return hash.digest('base64');
}

async function downloadVerified(url, destPath, feed, fetchFn) {
  const res = await fetchFn(url);
  if (!res.ok || !res.body) throw new Error(`instalador HTTP ${res.status}`);
  const hash = createHash('sha512');
  let size = 0;
  const source = Readable.fromWeb(res.body);
  source.on('data', (chunk) => {
    hash.update(chunk);
    size += chunk.length;
  });
  await pipeline(source, createWriteStream(destPath));
  if (size !== feed.size) throw new Error(`tamaño ${size} ≠ ${feed.size}`);
  if (hash.digest('base64') !== feed.sha512) throw new Error('sha512 no coincide con el feed');
}

async function removeStaleZips(dataDir, keep) {
  const files = await readdir(dataDir);
  await Promise.all(
    files
      .filter((f) => f.startsWith(`${PRODUCT_SLUG}-v`) && f.endsWith('.zip') && f !== keep)
      .map((f) => rm(path.join(dataDir, f), { force: true })),
  );
}

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
