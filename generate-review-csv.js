#!/usr/bin/env node

/**
 * Generate CSV for Google Sheets review of You.com search results
 * Creates a CSV with clickable hyperlinks and columns for rating
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the industry reports JSON
const reportsPath = path.join(__dirname, 'dashboard/data/industry-reports.json');
const reports = JSON.parse(fs.readFileSync(reportsPath, 'utf8'));

// Escape CSV field (handle quotes and commas)
function escapeCSV(text) {
  if (!text) return "";
  const str = String(text);
  // If contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Generate CSV rows
const rows = [];

// Header row
rows.push('Sector,Category,Query,Result #,Rating,Title,Source,URL,Snippet');

// Process each sector
const sectors = Object.keys(reports.sectors).sort();

for (const sectorKey of sectors) {
  const sector = reports.sectors[sectorKey];

  // Process each category (ai_impact, industry_trends, market_analysis)
  const categories = ['ai_impact', 'industry_trends', 'market_analysis'];

  for (const catKey of categories) {
    const category = sector.categories[catKey];
    if (!category) continue;

    const categoryName = category.description || catKey;
    const query = category.query || '';
    const results = category.results || [];

    // Process each result
    results.forEach((result, index) => {
      const row = [
        escapeCSV(sector.displayName || sector.sector),
        escapeCSV(categoryName),
        escapeCSV(query),
        String(index + 1),
        '', // Empty Rating column for user to fill
        escapeCSV(result.title || ''),
        escapeCSV(result.source || ''),
        escapeCSV(result.url || ''),
        escapeCSV(result.snippet || '')
      ];

      rows.push(row.join(','));
    });
  }
}

// Write CSV file
const outputPath = path.join(__dirname, 'you-search-results-review.csv');
fs.writeFileSync(outputPath, rows.join('\n'), 'utf8');

console.log(`✓ CSV generated: ${outputPath}`);
console.log(`  Total rows: ${rows.length - 1} (plus header)`);
console.log(`  Sectors: ${sectors.length}`);
console.log(`\nNext steps:`);
console.log(`  1. Open you-search-results-review.csv in Google Sheets`);
console.log(`  2. Add Data Validation to Rating column (GOOD/OK/BAD dropdown)`);
console.log(`  3. Review all results and assign ratings`);
console.log(`  4. Export as CSV and share for analysis`);
