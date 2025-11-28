#!/usr/bin/env node

/**
 * Merge extracted model data into dashboard
 * Updates master_valuations.json with new model's valuations
 * Recalculates variance ratios and model metadata
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node merge-model-data.js <model-key>');
  console.error('');
  console.error('Example: node merge-model-data.js claude_opus45');
  console.error('');
  process.exit(1);
}

const modelKey = args[0];

console.log('='.repeat(70));
console.log('Merge Model Data into Dashboard');
console.log('='.repeat(70));
console.log(`Model key: ${modelKey}`);
console.log('');

// Paths
const extractedPath = path.join(__dirname, 'dashboard/data/extracted', `${modelKey}.json`);
const masterPath = path.join(__dirname, 'dashboard/data/master_valuations.json');
const metadataPath = path.join(__dirname, 'dashboard/data/model_metadata.json');
const backupPath = path.join(__dirname, 'dashboard/data/backups', `master_valuations_${Date.now()}.json`);

// Validate extracted data exists
if (!fs.existsSync(extractedPath)) {
  console.error(`ERROR: Extracted data not found: ${extractedPath}`);
  console.error('');
  console.error('Run extraction first:');
  console.error(`  node extract-model-data.js <report-file> ${modelKey}`);
  console.error('');
  process.exit(1);
}

// Load data
console.log('Loading data files...');
const extractedData = JSON.parse(fs.readFileSync(extractedPath, 'utf8'));
const masterData = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const metadataExists = fs.existsSync(metadataPath);
const metadata = metadataExists ? JSON.parse(fs.readFileSync(metadataPath, 'utf8')) : { models: {} };

console.log(`✓ Loaded ${extractedData.artifacts.length} artifacts from extraction`);
console.log(`✓ Loaded ${masterData.artifacts.length} artifacts from master data`);
console.log('');

// Create backup
console.log('Creating backup...');
const backupDir = path.join(__dirname, 'dashboard/data/backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}
fs.writeFileSync(backupPath, JSON.stringify(masterData, null, 2));
console.log(`✓ Backup saved: ${backupPath}`);
console.log('');

// Merge valuations
console.log('Merging valuations...');
let matchedCount = 0;
let newArtifactsCount = 0;
let unmatchedCount = 0;

// First, update existing artifacts with matched valuations
for (const extracted of extractedData.artifacts) {
  if (extracted.matched_id) {
    const existing = masterData.artifacts.find(a => a.id === extracted.matched_id);
    if (existing) {
      existing.valuations[modelKey] = extracted.value;
      matchedCount++;
    } else {
      console.warn(`Warning: matched_id "${extracted.matched_id}" not found in master data`);
      unmatchedCount++;
    }
  } else {
    unmatchedCount++;
  }
}

console.log(`  ✓ Matched and updated: ${matchedCount} artifacts`);
if (unmatchedCount > 0) {
  console.log(`  ! Unmatched artifacts: ${unmatchedCount} (these won't appear in dashboard)`);
}
console.log('');

// Recalculate variance ratios
console.log('Recalculating variance ratios...');
for (const artifact of masterData.artifacts) {
  const values = Object.values(artifact.valuations).filter(v => v !== null && v > 0);

  if (values.length >= 2) {
    const max = Math.max(...values);
    const min = Math.min(...values);
    artifact.variance_ratio = parseFloat((max / min).toFixed(2));
  } else {
    artifact.variance_ratio = null;
  }
}
console.log('✓ Variance ratios updated');
console.log('');

// Calculate model metadata scores
console.log('Calculating model characteristics...');

// Get all artifacts with high-confidence market data (reference set)
const highConfidenceArtifacts = masterData.artifacts.filter(a =>
  a.market_estimate && a.market_estimate.confidence >= 80
);

// Coverage Score: % of high-confidence artifacts this model valued
const modelValuations = masterData.artifacts.filter(a => a.valuations[modelKey] !== null && a.valuations[modelKey] !== undefined);
const coverageCount = highConfidenceArtifacts.filter(a => a.valuations[modelKey] !== null && a.valuations[modelKey] !== undefined).length;
const coverageScore = highConfidenceArtifacts.length > 0
  ? Math.round((coverageCount / highConfidenceArtifacts.length) * 100)
  : 0;

// Uniqueness Score: % of artifacts where this model's value is >30% different from median
let uniqueCount = 0;
for (const artifact of modelValuations) {
  const modelValue = artifact.valuations[modelKey];
  const otherValues = Object.entries(artifact.valuations)
    .filter(([k, v]) => k !== modelKey && v !== null && v > 0)
    .map(([k, v]) => v);

  if (otherValues.length >= 2) {
    const median = otherValues.sort((a, b) => a - b)[Math.floor(otherValues.length / 2)];
    const percentDiff = Math.abs((modelValue - median) / median);
    if (percentDiff > 0.3) {
      uniqueCount++;
    }
  }
}
const uniquenessScore = modelValuations.length > 0
  ? Math.round((uniqueCount / modelValuations.length) * 100)
  : 0;

// Deviation Score: Average % difference from ensemble consensus
let totalDeviation = 0;
let deviationCount = 0;
for (const artifact of modelValuations) {
  const modelValue = artifact.valuations[modelKey];
  const otherValues = Object.entries(artifact.valuations)
    .filter(([k, v]) => k !== modelKey && v !== null && v > 0)
    .map(([k, v]) => v);

  if (otherValues.length >= 2) {
    const mean = otherValues.reduce((sum, v) => sum + v, 0) / otherValues.length;
    const percentDiff = Math.abs((modelValue - mean) / mean) * 100;
    totalDeviation += percentDiff;
    deviationCount++;
  }
}
const deviationScore = deviationCount > 0
  ? Math.round(totalDeviation / deviationCount)
  : 0;

// Find top artifact and value
const modelArtifacts = masterData.artifacts
  .filter(a => a.valuations[modelKey] !== null && a.valuations[modelKey] > 0)
  .sort((a, b) => b.valuations[modelKey] - a.valuations[modelKey]);

const topArtifact = modelArtifacts[0]?.name || 'N/A';
const topValue = modelArtifacts[0]?.valuations[modelKey] || 0;

console.log(`  Coverage: ${coverageScore}% (${coverageCount}/${highConfidenceArtifacts.length} high-confidence artifacts)`);
console.log(`  Uniqueness: ${uniquenessScore}% (${uniqueCount}/${modelValuations.length} distinctive perspectives)`);
console.log(`  Deviation: ${deviationScore}% (average difference from ensemble)`);
console.log(`  Top artifact: ${topArtifact} ($${(topValue / 1000000).toFixed(1)}M)`);
console.log('');

// Update or create metadata
if (!metadata.models[modelKey]) {
  console.log(`Creating new metadata entry for ${modelKey}...`);
  metadata.models[modelKey] = {
    name: extractedData.model_name || modelKey,
    color: '#808080', // Default gray - user should update
    methodology: extractedData.methodology || 'Methodology not specified',
    strengths: 'To be added',
    topArtifact: topArtifact,
    topValue: topValue,
    coverageScore: coverageScore,
    uniquenessScore: uniquenessScore,
    deviationScore: deviationScore
  };
  console.log('⚠ Remember to update the model color in model_metadata.json!');
} else {
  console.log(`Updating existing metadata for ${modelKey}...`);
  metadata.models[modelKey].topArtifact = topArtifact;
  metadata.models[modelKey].topValue = topValue;
  metadata.models[modelKey].coverageScore = coverageScore;
  metadata.models[modelKey].uniquenessScore = uniquenessScore;
  metadata.models[modelKey].deviationScore = deviationScore;
}
console.log('');

// Save updated data
console.log('Saving updated data...');
fs.writeFileSync(masterPath, JSON.stringify(masterData, null, 2));
fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
console.log('✓ Updated master_valuations.json');
console.log('✓ Updated model_metadata.json');
console.log('');

// Summary
console.log('='.repeat(70));
console.log('MERGE COMPLETE!');
console.log('='.repeat(70));
console.log(`Model: ${extractedData.model_name || modelKey}`);
console.log(`Artifacts updated: ${matchedCount}`);
console.log(`Coverage: ${coverageScore}%`);
console.log(`Uniqueness: ${uniquenessScore}%`);
console.log(`Deviation: ${deviationScore}%`);
console.log('');
console.log('Next steps:');
console.log('  1. Review model_metadata.json and update color/methodology if needed');
console.log('  2. Test dashboard: open dashboard/index.html');
console.log('  3. Commit changes: git add . && git commit -m "Add [model] valuations"');
console.log('  4. Deploy: git push origin main');
console.log('');

// Show unmatched artifacts if any
if (unmatchedCount > 0) {
  console.log('⚠ UNMATCHED ARTIFACTS (not added to dashboard):');
  console.log('─'.repeat(70));
  extractedData.artifacts
    .filter(a => !a.matched_id)
    .slice(0, 10)
    .forEach(a => {
      console.log(`  - ${a.name} ($${(a.value / 1000000).toFixed(1)}M)`);
    });
  if (unmatchedCount > 10) {
    console.log(`  ... and ${unmatchedCount - 10} more`);
  }
  console.log('');
  console.log('To add these artifacts:');
  console.log('  1. Manually match them to existing artifacts in extracted JSON');
  console.log('  2. Or add new artifact entries to master_valuations.json');
  console.log('  3. Re-run this merge script');
  console.log('');
}
