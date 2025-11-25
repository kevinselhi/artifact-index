#!/usr/bin/env node

/**
 * Batch fetch You.com search results for all 227 artifacts
 * Results are stored in dashboard/data/you-search-results.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const YOU_API_KEY = process.env.YOU_API_KEY;
const YOU_BASE_URL = process.env.YOU_BASE_URL || 'https://ydc-index.io/v1';
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE) || 5;
const DELAY_BETWEEN_BATCHES = 3000; // 3 seconds to avoid rate limits
const RESULTS_PER_ARTIFACT = parseInt(process.env.RESULTS_PER_ARTIFACT) || 3;
const MAX_ARTIFACTS = parseInt(process.env.MAX_ARTIFACTS) || Infinity;

console.log('='.repeat(60));
console.log('You.com Search Results Batch Fetcher');
console.log('='.repeat(60));

if (!YOU_API_KEY) {
  console.error('ERROR: YOU_API_KEY environment variable is not set');
  console.error('Set it with: export YOU_API_KEY="your-api-key"');
  process.exit(1);
}

console.log(`API Key: ${YOU_API_KEY.slice(0, 10)}...${YOU_API_KEY.slice(-5)}`);
console.log(`Base URL: ${YOU_BASE_URL}`);
console.log(`Batch size: ${BATCH_SIZE}`);
console.log(`Results per artifact: ${RESULTS_PER_ARTIFACT}`);
console.log(`Max artifacts: ${MAX_ARTIFACTS === Infinity ? 'all' : MAX_ARTIFACTS}`);

// Load artifacts
const valuationsPath = path.join(__dirname, 'dashboard/data/master_valuations.json');
const valuations = JSON.parse(fs.readFileSync(valuationsPath, 'utf8'));
let artifacts = valuations.artifacts;

// Limit artifacts if MAX_ARTIFACTS is set
if (MAX_ARTIFACTS !== Infinity && MAX_ARTIFACTS < artifacts.length) {
  artifacts = artifacts.slice(0, MAX_ARTIFACTS);
  console.log(`⚠️  Limited to first ${MAX_ARTIFACTS} artifacts for testing`);
}

console.log(`Found ${artifacts.length} artifacts to process`);
console.log('='.repeat(60));

// Sleep helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch You.com search results
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
      console.error(`API Error ${response.status}: ${text.slice(0, 200)}`);
      return { error: `HTTP ${response.status}`, results: [] };
    }

    const data = await response.json();
    const results = (data.results?.web || []).map(item => ({
      title: item.title || '',
      url: item.url || '',
      snippet: item.description || item.snippets?.[0] || '',
      source: item.source || '',
      publishedAt: item.page_age || ''
    }));

    return { results, query };
  } catch (error) {
    console.error(`Fetch error: ${error.message}`);
    return { error: error.message, results: [] };
  }
}

// Build search query for an artifact
function buildQuery(artifact) {
  const sector = artifact.sector || '';
  const name = artifact.name || '';

  // Create focused query: artifact name + sector + AI automation terms
  return `${name} ${sector} AI automation agents artificial intelligence proof of concept pilot 2024 2025`.trim();
}

// Process artifacts in batches
async function processBatches() {
  const results = {};
  const batches = [];

  // Split into batches
  for (let i = 0; i < artifacts.length; i += BATCH_SIZE) {
    batches.push(artifacts.slice(i, i + BATCH_SIZE));
  }

  console.log(`Processing ${batches.length} batches of ${BATCH_SIZE} artifacts each`);
  console.log(`Estimated time: ${Math.ceil(batches.length * DELAY_BETWEEN_BATCHES / 60000)} minutes\n`);

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const batchNum = batchIndex + 1;

    console.log(`\n=== Batch ${batchNum}/${batches.length} ===`);

    // Process batch in parallel
    const promises = batch.map(async (artifact) => {
      const query = buildQuery(artifact);
      console.log(`  Fetching: ${artifact.name.slice(0, 50)}...`);

      const result = await fetchYouSearch(query, RESULTS_PER_ARTIFACT);

      return {
        id: artifact.id,
        name: artifact.name,
        sector: artifact.sector,
        query,
        results: result.results,
        error: result.error,
        fetchedAt: new Date().toISOString()
      };
    });

    const batchResults = await Promise.all(promises);

    // Store results
    batchResults.forEach(result => {
      results[result.id] = result;
      console.log(`  ✓ ${result.name}: ${result.results.length} results`);
    });

    // Save progress after each batch
    const outputPath = path.join(__dirname, 'dashboard/data/you-search-results.json');
    fs.writeFileSync(outputPath, JSON.stringify({
      artifacts: results,
      metadata: {
        totalArtifacts: artifacts.length,
        processedArtifacts: Object.keys(results).length,
        lastUpdated: new Date().toISOString(),
        resultsPerArtifact: RESULTS_PER_ARTIFACT,
        apiProvider: 'You.com Search API'
      }
    }, null, 2));

    console.log(`  Progress saved: ${Object.keys(results).length}/${artifacts.length} artifacts`);

    // Wait before next batch (except for last batch)
    if (batchIndex < batches.length - 1) {
      console.log(`  Waiting ${DELAY_BETWEEN_BATCHES/1000}s before next batch...`);
      await sleep(DELAY_BETWEEN_BATCHES);
    }
  }

  return results;
}

// Main execution
async function main() {
  try {
    const results = await processBatches();

    console.log('\n' + '='.repeat(60));
    console.log('COMPLETE!');
    console.log('='.repeat(60));
    console.log(`Total artifacts processed: ${Object.keys(results).length}`);
    console.log(`Output file: dashboard/data/you-search-results.json`);

    // Summary stats
    const totalResults = Object.values(results).reduce((sum, r) => sum + r.results.length, 0);
    const avgResults = (totalResults / Object.keys(results).length).toFixed(1);
    const withErrors = Object.values(results).filter(r => r.error).length;

    console.log(`\nStatistics:`);
    console.log(`  - Total search results: ${totalResults}`);
    console.log(`  - Average per artifact: ${avgResults}`);
    console.log(`  - Artifacts with errors: ${withErrors}`);
    console.log('\nReady to use in dashboard!');

  } catch (error) {
    console.error('\nFATAL ERROR:', error);
    process.exit(1);
  }
}

main();
