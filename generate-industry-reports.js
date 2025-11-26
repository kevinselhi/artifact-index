#!/usr/bin/env node

/**
 * Generate Industry Reports using You.com API
 * Creates comprehensive industry news and trends reports for each sector
 * Results stored in dashboard/data/industry-reports.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const YOU_API_KEY = process.env.YOU_API_KEY;
const YOU_BASE_URL = process.env.YOU_BASE_URL || 'https://ydc-index.io';
const RESULTS_PER_SECTOR = parseInt(process.env.RESULTS_PER_SECTOR) || 10;
const DELAY_BETWEEN_REQUESTS = 1000; // 1 second

console.log('='.repeat(60));
console.log('Industry Reports Generator - You.com API');
console.log('='.repeat(60));

if (!YOU_API_KEY) {
  console.error('ERROR: YOU_API_KEY environment variable is not set');
  console.error('Set it with: export YOU_API_KEY="your-api-key"');
  process.exit(1);
}

console.log(`API Key: ${YOU_API_KEY.slice(0, 10)}...${YOU_API_KEY.slice(-5)}`);
console.log(`Base URL: ${YOU_BASE_URL}`);
console.log(`Results per sector: ${RESULTS_PER_SECTOR}`);
console.log('='.repeat(60));

// Load artifacts to get sectors
const valuationsPath = path.join(__dirname, 'dashboard/data/master_valuations.json');
const valuations = JSON.parse(fs.readFileSync(valuationsPath, 'utf8'));

// Extract unique sectors
const sectors = [...new Set(valuations.artifacts.map(a => a.sector))].sort();

console.log(`Found ${sectors.length} unique sectors to analyze\n`);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch You.com search results
async function fetchYouSearch(query, limit = 10) {
  const url = new URL('/v1/search', YOU_BASE_URL);
  url.searchParams.set('query', query);
  url.searchParams.set('count', String(limit));

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-API-Key': YOU_API_KEY
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
      source: extractSource(item.url || '')
    }));

    return { results, query };
  } catch (error) {
    console.error(`Fetch error: ${error.message}`);
    return { error: error.message, results: [] };
  }
}

// Extract source from URL
function extractSource(url) {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    const domainParts = domain.split('.');
    return domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1);
  } catch (e) {
    return 'Unknown';
  }
}

// Build queries for each sector
function buildQueries(sector) {
  // Create multiple query variations for comprehensive coverage
  const baseSector = sector.split('/')[0]; // Handle compound sectors like "Legal/Financial"

  return [
    {
      type: 'ai_impact',
      query: `AI automation impact on ${baseSector} professional services 2024`,
      description: 'AI Impact & Automation Trends'
    },
    {
      type: 'industry_trends',
      query: `${baseSector} industry trends innovation 2024`,
      description: 'Industry Trends & Innovation'
    },
    {
      type: 'market_analysis',
      query: `${baseSector} market analysis professional services`,
      description: 'Market Analysis & Insights'
    }
  ];
}

// Simplify sector name for cleaner display
function simplifySectorName(sector) {
  return sector.split('/')[0]; // Take first part of compound sectors
}

// Main processing function
async function generateReports() {
  const reports = {};

  console.log('Generating industry reports...\n');

  for (let i = 0; i < sectors.length; i++) {
    const sector = sectors[i];
    const queries = buildQueries(sector);

    console.log(`\n[${i+1}/${sectors.length}] ${sector}`);
    console.log('─'.repeat(60));

    const sectorResults = {
      sector: sector,
      displayName: simplifySectorName(sector),
      categories: {},
      totalResults: 0,
      lastUpdated: new Date().toISOString()
    };

    // Fetch results for each query type
    for (const queryDef of queries) {
      console.log(`  → ${queryDef.description}`);
      console.log(`    Query: "${queryDef.query}"`);

      const result = await fetchYouSearch(queryDef.query, Math.ceil(RESULTS_PER_SECTOR / queries.length));

      sectorResults.categories[queryDef.type] = {
        description: queryDef.description,
        query: queryDef.query,
        results: result.results || [],
        error: result.error
      };

      sectorResults.totalResults += (result.results || []).length;
      console.log(`    Results: ${result.results?.length || 0}`);

      // Small delay between queries
      await sleep(500);
    }

    reports[sector] = sectorResults;
    console.log(`  ✓ Total results for ${sector}: ${sectorResults.totalResults}`);

    // Save progress after each sector
    const outputPath = path.join(__dirname, 'dashboard/data/industry-reports.json');
    fs.writeFileSync(outputPath, JSON.stringify({
      sectors: reports,
      metadata: {
        totalSectors: sectors.length,
        processedSectors: Object.keys(reports).length,
        lastUpdated: new Date().toISOString(),
        resultsPerSector: RESULTS_PER_SECTOR,
        apiProvider: 'You.com Search API',
        queryTypes: ['ai_impact', 'industry_trends', 'market_analysis']
      }
    }, null, 2));

    // Wait before next sector
    if (i < sectors.length - 1) {
      await sleep(DELAY_BETWEEN_REQUESTS);
    }
  }

  return reports;
}

// Main execution
async function main() {
  try {
    const reports = await generateReports();

    console.log('\n' + '='.repeat(60));
    console.log('COMPLETE!');
    console.log('='.repeat(60));
    console.log(`Total sectors analyzed: ${Object.keys(reports).length}`);
    console.log(`Output file: dashboard/data/industry-reports.json`);

    // Summary stats
    const totalResults = Object.values(reports).reduce((sum, r) => sum + r.totalResults, 0);
    const avgResults = (totalResults / Object.keys(reports).length).toFixed(1);

    console.log(`\nStatistics:`);
    console.log(`  - Total industry insights: ${totalResults}`);
    console.log(`  - Average per sector: ${avgResults}`);
    console.log(`  - Query categories: AI Impact, Industry Trends, Market Analysis`);
    console.log('\nReady to use in dashboard!');

  } catch (error) {
    console.error('\nFATAL ERROR:', error);
    process.exit(1);
  }
}

main();
