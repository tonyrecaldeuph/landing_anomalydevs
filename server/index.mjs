import { createServer } from 'node:http';
import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const MAX_NAME_LEN = 100;
const MAX_EMAIL_LEN = 200;
const MAX_MESSAGE_LEN = 3000;
const MAX_BODY_BYTES = 16 * 1024;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
/** Hard cap on tracked IPs so the in-memory rate limiter cannot grow unbounded. */
const RATE_LIMIT_MAX_IPS = 10_000;

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/**
 * Validates a contact payload. The `website` field is a honeypot: humans never
 * see it, bots fill it — a non-empty value flags the submission as spam, which
 * the handler answers with a fake success so the bot learns nothing.
 */
export function validateLead(body) {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Cuerpo inválido.' };
  }
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return { ok: true, spam: true };
  }
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!name || !email || !message) {
    return { ok: false, error: 'Completa todos los campos antes de enviar.' };
  }
  if (name.length > MAX_NAME_LEN || email.length > MAX_EMAIL_LEN || message.length > MAX_MESSAGE_LEN) {
    return { ok: false, error: 'Uno de los campos supera la longitud máxima.' };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: 'El email no parece válido.' };
  }
  return { ok: true, spam: false, lead: { name, email, message } };
}

export function createRateLimiter({
  max = RATE_LIMIT_MAX,
  windowMs = RATE_LIMIT_WINDOW_MS,
  now = Date.now,
} = {}) {
  const hits = new Map();
  return function allow(ip) {
    const t = now();
    const cutoff = t - windowMs;
    const recent = (hits.get(ip) ?? []).filter((ts) => ts > cutoff);
    if (recent.length >= max) {
      hits.set(ip, recent);
      return false;
    }
    recent.push(t);
    if (!hits.has(ip) && hits.size >= RATE_LIMIT_MAX_IPS) {
      const oldest = hits.keys().next().value;
      hits.delete(oldest);
    }
    hits.set(ip, recent);
    return true;
  };
}

/** Cloudflare fronts the site, then the system Caddy, then the container Caddy. */
export function clientIp(req) {
  const cf = req.headers['cf-connecting-ip'];
  if (typeof cf === 'string' && cf) return cf;
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff) return xff.split(',')[0].trim();
  return req.socket?.remoteAddress ?? 'unknown';
}

export function formatTelegramText(lead) {
  const clip = (s, n) => (s.length > n ? `${s.slice(0, n)}…` : s);
  return [
    '📨 Nuevo lead — anomalydevs.qzz.io',
    `Nombre: ${clip(lead.name, MAX_NAME_LEN)}`,
    `Email: ${clip(lead.email, MAX_EMAIL_LEN)}`,
    '',
    clip(lead.message, MAX_MESSAGE_LEN),
  ].join('\n');
}

async function notifyTelegram(lead, { token, chatId, fetchFn = fetch, logger = console }) {
  if (!token || !chatId) return false;
  try {
    const res = await fetchFn(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Plain text on purpose: no parse_mode means user content cannot break the markup.
      body: JSON.stringify({ chat_id: chatId, text: formatTelegramText(lead) }),
    });
    if (!res.ok) {
      logger.error(`telegram notify failed: HTTP ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    logger.error(`telegram notify failed: ${err?.message ?? err}`);
    return false;
  }
}

async function storeLead(lead, dataDir) {
  await mkdir(dataDir, { recursive: true });
  const line = JSON.stringify({ at: new Date().toISOString(), ...lead });
  await appendFile(path.join(dataDir, 'leads.jsonl'), `${line}\n`, 'utf8');
}

function readJsonBody(req, maxBytes = MAX_BODY_BYTES) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error('body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new Error('invalid json'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

export function createApp({
  dataDir = '/data',
  telegram = { token: '', chatId: '' },
  rateLimiter = createRateLimiter(),
  fetchFn = fetch,
  logger = console,
} = {}) {
  return async function handler(req, res) {
    const url = req.url?.split('?')[0] ?? '/';

    if (req.method === 'GET' && url === '/api/health') {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === 'POST' && url === '/api/contact') {
      if (!rateLimiter(clientIp(req))) {
        sendJson(res, 429, { ok: false, error: 'Demasiados envíos. Intenta de nuevo más tarde.' });
        return;
      }
      let body;
      try {
        body = await readJsonBody(req);
      } catch {
        sendJson(res, 400, { ok: false, error: 'Cuerpo inválido.' });
        return;
      }
      const result = validateLead(body);
      if (!result.ok) {
        sendJson(res, 400, { ok: false, error: result.error });
        return;
      }
      if (result.spam) {
        sendJson(res, 200, { ok: true });
        return;
      }
      try {
        await storeLead(result.lead, dataDir);
      } catch (err) {
        logger.error(`lead store failed: ${err?.message ?? err}`);
        sendJson(res, 500, { ok: false, error: 'No se pudo guardar el mensaje. Intenta de nuevo.' });
        return;
      }
      // The lead is already persisted — a Telegram failure must not fail the request.
      await notifyTelegram(result.lead, { ...telegram, fetchFn, logger });
      sendJson(res, 200, { ok: true });
      return;
    }

    sendJson(res, 404, { ok: false, error: 'Not found' });
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const port = Number(process.env.PORT ?? 3000);
  const app = createApp({
    dataDir: process.env.DATA_DIR ?? '/data',
    telegram: {
      token: process.env.TELEGRAM_BOT_TOKEN ?? '',
      chatId: process.env.TELEGRAM_CHAT_ID ?? '',
    },
  });
  createServer(app).listen(port, () => {
    console.log(`contact api listening on :${port}`);
  });
}
