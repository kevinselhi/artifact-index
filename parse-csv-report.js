#!/usr/bin/env node

/**
 * Parse CSV format reports to extract all 100 artifacts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('Usage: node parse-csv-report.js <report-file> <model-key>');
  process.exit(1);
}

const reportPath = args[0];
const modelKey = args[1];

console.log('======================================================================');
console.log('CSV Report Parser');
console.log('======================================================================');
console.log(`Report: ${reportPath}`);
console.log(`Model: ${modelKey}`);
console.log('');

const reportContent = fs.readFileSync(reportPath, 'utf8');

// Extract model name
const modelName = "You.com ARI";

// Find CSV section between ```csv and ```
const csvMatch = reportContent.match(/```csv\n([\s\S]+?)\n```/);
if (!csvMatch) {
  console.error('ERROR: No CSV data found in report');
  process.exit(1);
}

const csvData = csvMatch[1];
const lines = csvData.split('\n').filter(line => line.trim());

// Skip header row
const dataLines = lines.slice(1);

const artifacts = [];

for (const line of dataLines) {
  // Parse CSV with regex to handle commas in fields
  // Format: Rank,Name,Value,Sector,Producer
  // Both name and value fields can contain commas
  // Use value pattern as anchor since it has specific format: $N,NNN,NNN-$N,NNN,NNN
  const match = line.match(/^(\d+),(.+?),(\$[0-9,]+-\$[0-9,]+),([^,]+),(.+)$/);
  if (!match) continue;

  const rank = parseInt(match[1]);
  const name = match[2];
  const valueStr = match[3];
  const sector = match[4];

  // Parse value range and calculate midpoint
  let value = 0;
  const valueMatch = valueStr.match(/\$([0-9,]+)-\$([0-9,]+)/);
  if (valueMatch) {
    const low = parseInt(valueMatch[1].replace(/,/g, ''));
    const high = parseInt(valueMatch[2].replace(/,/g, ''));
    value = Math.round((low + high) / 2);
  }

  if (value > 0 && name && sector) {
    artifacts.push({
      rank,
      name,
      value,
      sector: normalizeSector(sector),
      confidence: 'high' // You.com ARI has comprehensive sourcing
    });
  }
}

function normalizeSector(sector) {
  sector = sector.trim();

  const sectorMap = {
    'Medical/Pharmaceutical': 'Medical/Pharma',
    'Technology Services': 'Technology',
    'Architecture and Construction': 'Architecture',
    'Creative and Marketing Services': 'Creative/Marketing',
    'Environmental and Regulatory': 'Environmental/Engineering'
  };

  return sectorMap[sector] || sector;
}

console.log(`Extracted ${artifacts.length} artifacts from CSV`);
console.log('');

// Sort by rank
artifacts.sort((a, b) => a.rank - b.rank);

// Create output
const output = {
  model_key: modelKey,
  model_name: modelName,
  methodology: 'Triangulated research from multiple sources',
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
console.log('Next step: node merge-model-data.js ' + modelKey);
