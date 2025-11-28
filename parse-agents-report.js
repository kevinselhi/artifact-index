#!/usr/bin/env node

/**
 * Parse Claude Agents report with different table format
 * Format: | Rank | Artifact Name | Sector | Estimated 2020 Value | Per-Artifact Range | Mode Estimate | Primary Producers |
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('Usage: node parse-agents-report.js <report-file> <model-key>');
  process.exit(1);
}

const reportPath = args[0];
const modelKey = args[1];

console.log('======================================================================');
console.log('Claude Agents Report Parser');
console.log('======================================================================');
console.log(`Report: ${reportPath}`);
console.log(`Model: ${modelKey}`);
console.log('');

const reportContent = fs.readFileSync(reportPath, 'utf8');

// Extract model name
let modelName = "Claude 4.5 Opus with Agents";
const nameMatch = reportContent.match(/Created with (.+?)(?:\n|$)/i);
if (nameMatch) {
  modelName = nameMatch[1].trim();
}

// Find table rows
// Format: | Rank | Artifact Name | Sector | Estimated 2020 Value | Per-Artifact Range | Mode Estimate | Primary Producers |
const tableRegex = /\|\s*(\d+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g;
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
  const sector = match[3].trim();
  const rangeStr = match[5].trim(); // Per-Artifact Range column

  // Parse value range and calculate midpoint
  let value = 0;
  const rangeMatch = rangeStr.match(/\$([0-9.]+)([KMB]?)\s*-\s*\$([0-9.]+)([KMB]?)/i);
  if (rangeMatch) {
    const low = parseValue(rangeMatch[1], rangeMatch[2]);
    const high = parseValue(rangeMatch[3], rangeMatch[4]);
    value = Math.round((low + high) / 2);
  }

  if (value > 0 && name && sector) {
    artifacts.push({
      rank,
      name,
      value,
      sector: normalizeSector(sector),
      confidence: 'high' // Agents report has high confidence with multi-agent verification
    });
  }
}

function parseValue(num, suffix) {
  const n = parseFloat(num);
  const s = suffix.toUpperCase();

  if (s === 'M') return n * 1000000;
  if (s === 'K') return n * 1000;
  if (s === 'B') return n * 1000000000;
  return n;
}

function normalizeSector(sector) {
  sector = sector.trim();

  const sectorMap = {
    'Financial/Legal': 'Financial Services',
    'Medical/Pharma': 'Medical/Pharma',
    'Technology': 'Technology',
    'Legal': 'Legal Services',
    'Engineering': 'Engineering',
    'Consulting': 'Management Consulting'
  };

  return sectorMap[sector] || sector;
}

console.log(`Extracted ${artifacts.length} artifacts from table`);
console.log('');

if (artifacts.length === 0) {
  console.error('ERROR: No artifacts found');
  process.exit(1);
}

// Sort by rank
artifacts.sort((a, b) => a.rank - b.rank);

// Create output
const output = {
  model_key: modelKey,
  model_name: modelName,
  methodology: 'Multi-agent methodology with web search verification',
  artifacts: artifacts.map(a => ({
    name: a.name,
    value: a.value,
    sector: a.sector,
    confidence: a.confidence
  }))
};

// Save
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
console.log('Next steps:');
console.log('  1. node match-artifacts.js ' + modelKey);
console.log('  2. node merge-model-data.js ' + modelKey);
