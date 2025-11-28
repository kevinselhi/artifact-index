#!/usr/bin/env node

/**
 * Parse markdown table reports to extract all 100 artifacts
 * Works with reports that have artifacts in markdown table format
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('Usage: node parse-markdown-table.js <report-file> <model-key>');
  console.error('Example: node parse-markdown-table.js "report.md" "claude_opus45_cli"');
  process.exit(1);
}

const reportPath = args[0];
const modelKey = args[1];

console.log('======================================================================');
console.log('Markdown Table Parser');
console.log('======================================================================');
console.log(`Report: ${reportPath}`);
console.log(`Model: ${modelKey}`);
console.log('');

// Read the report file
const reportContent = fs.readFileSync(reportPath, 'utf8');

// Extract model name from report
let modelName = modelKey;
const nameMatch = reportContent.match(/Created with (.+?)(?:\n|$)/i);
if (nameMatch) {
  modelName = nameMatch[1].trim();
}

// Find the table section with artifacts (only ranks 1-100)
const tableRegex = /\|\s*(\d+)\s*\|\s*([^|]+)\s*\|\s*\$([^|]+)\s*\|\s*([^|]+)\s*\|/g;
const artifacts = [];
const seenRanks = new Set();
let match;

while ((match = tableRegex.exec(reportContent)) !== null) {
  const rank = parseInt(match[1].trim());

  // Only accept ranks 1-100 and skip duplicates
  if (rank < 1 || rank > 100) continue;
  if (seenRanks.has(rank)) continue;
  seenRanks.add(rank);

  const name = match[2].trim();
  const valueStr = match[3].trim();
  const sector = match[4].trim();

  // Parse value - extract midpoint from range
  let value = 0;

  // Handle different value formats
  if (valueStr.includes('-')) {
    // Range format: "$50M - $120M+"
    const values = valueStr.replace(/\$/g, '').replace(/\+/g, '').split('-').map(s => s.trim());
    const low = parseValue(values[0]);
    const high = parseValue(values[1]);
    value = Math.round((low + high) / 2);
  } else {
    // Single value
    value = parseValue(valueStr.replace(/\$/g, '').replace(/\+/g, '').trim());
  }

  if (value > 0 && name && sector) {
    artifacts.push({
      rank,
      name,
      value,
      sector: normalizeSector(sector),
      confidence: 'medium' // Default confidence
    });
  }
}

function parseValue(str) {
  str = str.trim();

  // Handle M (millions)
  if (str.match(/m$/i)) {
    return parseFloat(str.replace(/m/i, '')) * 1000000;
  }

  // Handle K (thousands)
  if (str.match(/k$/i)) {
    return parseFloat(str.replace(/k/i, '')) * 1000;
  }

  // Handle B (billions)
  if (str.match(/b$/i)) {
    return parseFloat(str.replace(/b/i, '')) * 1000000000;
  }

  // Handle comma-separated numbers
  return parseFloat(str.replace(/,/g, ''));
}

function normalizeSector(sector) {
  sector = sector.trim();

  // Common mappings
  const sectorMap = {
    'Investment Banking': 'Financial Services',
    'Bulge Bracket Investment Banks': 'Financial Services',
    'Financial/Legal': 'Legal/Financial',
    'Medical': 'Medical/Pharma',
    'Pharma': 'Medical/Pharma',
    'Pharmaceutical': 'Medical/Pharma',
    'Consulting': 'Management Consulting',
    'Tech': 'Technology',
    'IT': 'Technology',
    'Legal': 'Legal',
    'Engineering': 'Engineering'
  };

  return sectorMap[sector] || sector;
}

console.log(`Extracted ${artifacts.length} artifacts from table`);
console.log('');

if (artifacts.length === 0) {
  console.error('ERROR: No artifacts found in table format');
  console.error('Make sure the report has a markdown table with format:');
  console.error('| Rank | Name | Value | Sector | ... |');
  process.exit(1);
}

// Sort by rank
artifacts.sort((a, b) => a.rank - b.rank);

// Create output
const output = {
  model_key: modelKey,
  model_name: modelName,
  methodology: 'Extracted from report table',
  artifacts: artifacts.map(a => ({
    name: a.name,
    value: a.value,
    sector: a.sector,
    confidence: a.confidence
  }))
};

// Save to extracted directory
const outputDir = path.join(__dirname, 'dashboard/data/extracted');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, `${modelKey}.json`);
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`✅ Saved ${artifacts.length} artifacts to: ${outputPath}`);
console.log('');
console.log('Top 5 artifacts:');
artifacts.slice(0, 5).forEach(a => {
  console.log(`  ${a.rank}. ${a.name} - $${(a.value / 1000000).toFixed(1)}M (${a.sector})`);
});
console.log('');
console.log('Next step: node merge-model-data.js ' + modelKey);
