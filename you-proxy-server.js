#!/usr/bin/env node

/**
 * Simple proxy server to bypass CORS restrictions for You.com API
 * Run with: node you-proxy-server.js
 */

import http from 'http';
import { URL } from 'url';

const PORT = 8081;
const YOU_API_KEY = process.env.YOU_API_KEY;
const YOU_BASE_URL = 'https://ydc-index.io/v1';

if (!YOU_API_KEY) {
  console.error('ERROR: YOU_API_KEY environment variable not set');
  console.error('Set it with: export YOU_API_KEY="your-key"');
  process.exit(1);
}

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Only handle /search endpoint
  if (!req.url.startsWith('/search')) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  try {
    // Parse query params
    const reqUrl = new URL(req.url, `http://localhost:${PORT}`);
    const query = reqUrl.searchParams.get('query');
    const count = reqUrl.searchParams.get('count') || '3';

    if (!query) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing query parameter' }));
      return;
    }

    console.log(`[proxy] Fetching: ${query.slice(0, 60)}... (count=${count})`);

    // Make request to You.com API
    const apiUrl = new URL('/search', YOU_BASE_URL);
    apiUrl.searchParams.set('query', query);
    apiUrl.searchParams.set('count', count);

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'X-API-Key': YOU_API_KEY,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[proxy] API Error ${response.status}:`, JSON.stringify(data).slice(0, 200));
      res.writeHead(response.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `API Error ${response.status}`, details: data }));
      return;
    }

    console.log(`[proxy] Success: ${data.results?.web?.length || 0} results`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));

  } catch (error) {
    console.error('[proxy] Error:', error.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('You.com API Proxy Server');
  console.log('='.repeat(60));
  console.log(`Running on: http://localhost:${PORT}`);
  console.log(`API Key: ${YOU_API_KEY.slice(0, 10)}...${YOU_API_KEY.slice(-5)}`);
  console.log('');
  console.log('Test with:');
  console.log(`  curl "http://localhost:${PORT}/search?query=test&count=3"`);
  console.log('');
  console.log('Use in fetch page: change API endpoint to http://localhost:8081');
  console.log('='.repeat(60));
});
