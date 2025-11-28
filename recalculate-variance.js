#!/usr/bin/env node

/**
 * Recalculate variance ratios for all artifacts
 * Useful after manual edits to master_valuations.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const masterPath = path.join(__dirname, 'dashboard/data/master_valuations.json');

console.log('Recalculating variance ratios...\n');

// Load data
const data = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

let updatedCount = 0;

// Recalculate for each artifact
for (const artifact of data.artifacts) {
  const values = Object.values(artifact.valuations).filter(v => v !== null && v > 0);

  if (values.length >= 2) {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const newRatio = parseFloat((max / min).toFixed(2));

    if (artifact.variance_ratio !== newRatio) {
      artifact.variance_ratio = newRatio;
      updatedCount++;
    }
  } else {
    artifact.variance_ratio = null;
  }
}

// Save
fs.writeFileSync(masterPath, JSON.stringify(data, null, 2));

console.log(`✓ Updated ${updatedCount} variance ratios`);
console.log(`✓ Saved to ${masterPath}\n`);
