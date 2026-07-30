// Throwaway static server for Lighthouse: Brotli + long cache on hashed assets.
import { createServer } from 'node:http';
import { brotliCompressSync, constants } from 'node:zlib';
import { readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const ROOT = join(process.cwd(), 'dist');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
};
const COMPRESS = new Set(['.html', '.css', '.js', '.svg', '.json', '.xml', '.txt']);
const cache = new Map();

createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const file = normalize(join(ROOT, p));
  if (!file.startsWith(ROOT)) return res.writeHead(403).end();

  let body, ext;
  try {
    ext = extname(file);
    if (!statSync(file).isFile()) throw new Error('dir');
    body = readFileSync(file);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('404');
  }

  const headers = { 'Content-Type': TYPES[ext] || 'application/octet-stream' };
  if (p.startsWith('/images/') || p.startsWith('/fonts/') || p.startsWith('/_astro/')) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  } else {
    headers['Cache-Control'] = 'no-cache';
  }

  if (COMPRESS.has(ext) && /\bbr\b/.test(req.headers['accept-encoding'] || '')) {
    let br = cache.get(file);
    if (!br) {
      br = brotliCompressSync(body, {
        params: { [constants.BROTLI_PARAM_QUALITY]: 11, [constants.BROTLI_PARAM_SIZE_HINT]: body.length },
      });
      cache.set(file, br);
    }
    headers['Content-Encoding'] = 'br';
    headers['Vary'] = 'Accept-Encoding';
    body = br;
  }
  headers['Content-Length'] = body.length;
  res.writeHead(200, headers);
  res.end(req.method === 'HEAD' ? undefined : body);
}).listen(8788, () => console.log('brotli server on http://localhost:8788'));
