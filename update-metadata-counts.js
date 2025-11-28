#!/usr/bin/env node

/**
 * Update metadata counts in master_valuations.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const masterPath = path.join(__dirname, 'dashboard/data/master_valuations.json');
const data = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

// Collect all unique models and sectors
const models = new Set();
const sectors = new Set();

data.artifacts.forEach(artifact => {
  Object.keys(artifact.valuations || {}).forEach(model => models.add(model));
  if (artifact.sector) sectors.add(artifact.sector);
});

// Update metadata
data.metadata = {
  generated: new Date().toISOString().split('T')[0],
  total_artifacts: data.artifacts.length,
  total_sectors: sectors.size,
  total_models: models.size,
  sectors: Array.from(sectors).sort(),
  models: Array.from(models).sort()
};

// Save
fs.writeFileSync(masterPath, JSON.stringify(data, null, 2) + '\n');

console.log('✅ Updated metadata:');
console.log(`  - Artifacts: ${data.metadata.total_artifacts}`);
console.log(`  - Models: ${data.metadata.total_models}`);
console.log(`  - Sectors: ${data.metadata.total_sectors}`);
console.log(`\nModels: ${Array.from(models).sort().join(', ')}`);
