// @vitest-environment node
import { createServer } from 'node:http';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it, expect, vi } from 'vitest';
import {
  validateLead,
  createRateLimiter,
  clientIp,
  formatTelegramText,
  createApp,
} from './index.mjs';

const goodLead = { name: 'Ana', email: 'ana@example.com', message: 'Quiero cotizar un proyecto.' };

describe('validateLead', () => {
  it('accepts a complete lead and trims its fields', () => {
    const result = validateLead({ name: '  Ana ', email: ' ana@example.com ', message: ' Hola ' });
    expect(result).toEqual({
      ok: true,
      spam: false,
      lead: { name: 'Ana', email: 'ana@example.com', message: 'Hola' },
    });
  });

  it('rejects missing fields', () => {
    expect(validateLead({ name: 'Ana', email: '', message: 'Hola' }).ok).toBe(false);
    expect(validateLead({}).ok).toBe(false);
    expect(validateLead(null).ok).toBe(false);
  });

  it('rejects malformed emails', () => {
    expect(validateLead({ ...goodLead, email: 'no-es-un-email' }).ok).toBe(false);
  });

  it('rejects oversized fields', () => {
    expect(validateLead({ ...goodLead, message: 'x'.repeat(3001) }).ok).toBe(false);
  });

  it('flags a filled honeypot as spam without erroring', () => {
    expect(validateLead({ ...goodLead, website: 'http://spam.example' })).toEqual({ ok: true, spam: true });
  });
});

describe('createRateLimiter', () => {
  it('allows up to max hits per window and blocks after', () => {
    let t = 0;
    const allow = createRateLimiter({ max: 3, windowMs: 1000, now: () => t });
    expect(allow('a')).toBe(true);
    expect(allow('a')).toBe(true);
    expect(allow('a')).toBe(true);
    expect(allow('a')).toBe(false);
    expect(allow('b')).toBe(true); // other IPs unaffected
    t = 1001; // window expired
    expect(allow('a')).toBe(true);
  });
});

describe('clientIp', () => {
  it('prefers CF-Connecting-IP, then first X-Forwarded-For hop, then the socket', () => {
    expect(clientIp({ headers: { 'cf-connecting-ip': '1.1.1.1', 'x-forwarded-for': '2.2.2.2' } })).toBe('1.1.1.1');
    expect(clientIp({ headers: { 'x-forwarded-for': '2.2.2.2, 3.3.3.3' } })).toBe('2.2.2.2');
    expect(clientIp({ headers: {}, socket: { remoteAddress: '4.4.4.4' } })).toBe('4.4.4.4');
  });
});

describe('formatTelegramText', () => {
  it('includes the lead fields as plain text', () => {
    const text = formatTelegramText(goodLead);
    expect(text).toContain('Ana');
    expect(text).toContain('ana@example.com');
    expect(text).toContain('Quiero cotizar un proyecto.');
  });
});

describe('POST /api/contact (integration)', () => {
  async function startServer(overrides = {}) {
    const dataDir = await mkdtemp(path.join(tmpdir(), 'leads-'));
    const fetchFn = vi.fn(async () => ({ ok: true }));
    const app = createApp({
      dataDir,
      telegram: { token: 'tok', chatId: '42' },
      fetchFn,
      logger: { error: vi.fn() },
      ...overrides,
    });
    const server = createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();
    const url = `http://127.0.0.1:${port}`;
    return { url, dataDir, fetchFn, close: () => new Promise((r) => server.close(r)) };
  }

  it('stores the lead and notifies telegram', async () => {
    const { url, dataDir, fetchFn, close } = await startServer();
    try {
      const res = await fetch(`${url}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goodLead),
      });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true });
      const stored = await readFile(path.join(dataDir, 'leads.jsonl'), 'utf8');
      expect(JSON.parse(stored.trim())).toMatchObject(goodLead);
      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(fetchFn.mock.calls[0][0]).toContain('api.telegram.org');
    } finally {
      await close();
    }
  });

  it('answers 400 for invalid payloads and does not notify', async () => {
    const { url, fetchFn, close } = await startServer();
    try {
      const res = await fetch(`${url}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Ana' }),
      });
      expect(res.status).toBe(400);
      expect(fetchFn).not.toHaveBeenCalled();
    } finally {
      await close();
    }
  });

  it('answers a fake success to honeypot submissions without storing or notifying', async () => {
    const { url, dataDir, fetchFn, close } = await startServer();
    try {
      const res = await fetch(`${url}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...goodLead, website: 'http://spam.example' }),
      });
      expect(res.status).toBe(200);
      await expect(readFile(path.join(dataDir, 'leads.jsonl'), 'utf8')).rejects.toThrow();
      expect(fetchFn).not.toHaveBeenCalled();
    } finally {
      await close();
    }
  });

  it('rate limits repeated submissions from one IP with 429', async () => {
    const { url, close } = await startServer({ rateLimiter: createRateLimiter({ max: 1, windowMs: 60_000 }) });
    try {
      const post = () =>
        fetch(`${url}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(goodLead),
        });
      expect((await post()).status).toBe(200);
      expect((await post()).status).toBe(429);
    } finally {
      await close();
    }
  });

  it('still answers 200 when telegram fails, because the lead is already stored', async () => {
    const { url, dataDir, close } = await startServer({ fetchFn: vi.fn(async () => ({ ok: false, status: 500 })) });
    try {
      const res = await fetch(`${url}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goodLead),
      });
      expect(res.status).toBe(200);
      const stored = await readFile(path.join(dataDir, 'leads.jsonl'), 'utf8');
      expect(JSON.parse(stored.trim())).toMatchObject(goodLead);
    } finally {
      await close();
    }
  });

  it('exposes a health endpoint', async () => {
    const { url, close } = await startServer();
    try {
      const res = await fetch(`${url}/api/health`);
      expect(res.status).toBe(200);
    } finally {
      await close();
    }
  });
});
