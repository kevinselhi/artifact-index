#!/usr/bin/env node

/**
 * TEST VERSION: Fetch You.com results for first 10 artifacts only
 * Use this to verify everything works before running full batch
 */

const fs = require('fs');
const path = require('path');

const YOU_API_KEY = process.env.YOU_API_KEY;
const YOU_BASE_URL = process.env.YOU_BASE_URL || 'https://api.ydc-index.io';
const TEST_LIMIT = 10; // Only process first 10 artifacts
const DELAY_BETWEEN_REQUESTS = 500; // 0.5 seconds

// Load artifacts
const valuationsPath = path.join(__dirname, 'dashboard/data/master_valuations.json');
const valuations = JSON.parse(fs.readFileSync(valuationsPath, 'utf8'));
const artifacts = valuations.artifacts.slice(0, TEST_LIMIT);

console.log(`TEST MODE: Processing first ${TEST_LIMIT} artifacts`);

if (!YOU_API_KEY) {
  console.error('ERROR: YOU_API_KEY environment variable is not set');
  process.exit(1);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchYouSearch(query, limit = 3) {
  const url = new URL('/search', YOU_BASE_URL);
  url.searchParams.set('query', query);
  url.searchParams.set('count', String(limit));

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-API-Key': YOU_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      return { error: `HTTP ${response.status}`, results: [] };
    }

    const data = await response.json();
    const results = (data.results?.web || []).map(item => ({
      title: item.title || '',
      url: item.url || '',
      snippet: item.description || item.snippets?.[0] || '',
      source: item.source || ''
    }));

    return { results, query };
  } catch (error) {
    return { error: error.message, results: [] };
  }
}

function buildQuery(artifact) {
  return `${artifact.name} ${artifact.sector} AI automation agents artificial intelligence 2024 2025`.trim();
}

async function main() {
  console.log('\n=== You.com Search Test ===\n');

  const results = {};

  for (let i = 0; i < artifacts.length; i++) {
    const artifact = artifacts[i];
    const query = buildQuery(artifact);

    console.log(`[${i+1}/${artifacts.length}] ${artifact.name}`);
    console.log(`    Query: ${query.slice(0, 80)}...`);

    const result = await fetchYouSearch(query, 3);

    results[artifact.id] = {
      id: artifact.id,
      name: artifact.name,
      sector: artifact.sector,
      query,
      results: result.results,
      error: result.error,
      fetchedAt: new Date().toISOString()
    };

    console.log(`    Results: ${result.results.length}`);
    if (result.results.length > 0) {
      console.log(`    Example: ${result.results[0].title.slice(0, 60)}...`);
    }
    console.log('');

    if (i < artifacts.length - 1) {
      await sleep(DELAY_BETWEEN_REQUESTS);
    }
  }

  // Save test results
  const outputPath = path.join(__dirname, 'dashboard/data/you-search-results-test.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    artifacts: results,
    metadata: {
      testMode: true,
      totalArtifacts: TEST_LIMIT,
      lastUpdated: new Date().toISOString()
    }
  }, null, 2));

  console.log('='.repeat(60));
  console.log(`✓ Test complete! Results saved to:`);
  console.log(`  ${outputPath}`);
  console.log('\nTo process all 227 artifacts, run:');
  console.log('  node fetch-you-results.js');
  console.log('='.repeat(60));
}

main();
