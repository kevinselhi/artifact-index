#!/usr/bin/env node

/**
 * Match extracted artifacts to master data using fuzzy matching
 * Updates extracted JSON files with matched_id fields
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple Levenshtein distance for string similarity
function levenshteinDistance(str1, str2) {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));
  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }
  return track[str2.length][str1.length];
}

function similarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 1.0;
  }

  return (longer.length - levenshteinDistance(longer, shorter)) / longer.length;
}

function normalizeArtifactName(name) {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, '') // Remove parentheticals
    .replace(/[&/]/g, ' and ') // Normalize &, /
    .replace(/[-_]/g, ' ') // Normalize separators
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();
}

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('Usage: node match-artifacts.js <model-key>');
  process.exit(1);
}

const modelKey = args[0];

console.log('======================================================================');
console.log('Match Extracted Artifacts to Master Data');
console.log('======================================================================');
console.log(`Model: ${modelKey}`);
console.log('');

// Load files
const extractedPath = path.join(__dirname, 'dashboard/data/extracted', `${modelKey}.json`);
const masterPath = path.join(__dirname, 'dashboard/data/master_valuations.json');

if (!fs.existsSync(extractedPath)) {
  console.error(`ERROR: Extracted file not found: ${extractedPath}`);
  process.exit(1);
}

if (!fs.existsSync(masterPath)) {
  console.error(`ERROR: Master file not found: ${masterPath}`);
  process.exit(1);
}

const extracted = JSON.parse(fs.readFileSync(extractedPath, 'utf8'));
const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

console.log(`Loaded ${extracted.artifacts.length} extracted artifacts`);
console.log(`Loaded ${master.artifacts.length} master artifacts`);
console.log('');

// Match artifacts
let matchedCount = 0;
let newCount = 0;
const threshold = 0.6; // Similarity threshold

for (const artifact of extracted.artifacts) {
  const extractedName = normalizeArtifactName(artifact.name);

  let bestMatch = null;
  let bestScore = 0;

  // Find best match in master data
  for (const masterArtifact of master.artifacts) {
    const masterName = normalizeArtifactName(masterArtifact.name);
    const score = similarity(extractedName, masterName);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = masterArtifact;
    }
  }

  // Assign match if above threshold
  if (bestScore >= threshold) {
    artifact.matched_id = bestMatch.id;
    artifact.match_score = parseFloat(bestScore.toFixed(2));
    matchedCount++;
  } else {
    // Mark as new artifact to be added
    artifact.matched_id = null;
    artifact.match_score = 0;
    newCount++;
  }
}

// Save updated extracted file
fs.writeFileSync(extractedPath, JSON.stringify(extracted, null, 2));

console.log('Matching complete!');
console.log(`✓ Matched to existing: ${matchedCount} artifacts`);
console.log(`✓ New artifacts: ${newCount} artifacts`);
console.log('');

// Show examples of matches
console.log('Sample matches (top 5):');
const matched = extracted.artifacts.filter(a => a.matched_id).slice(0, 5);
for (const artifact of matched) {
  const masterArtifact = master.artifacts.find(a => a.id === artifact.matched_id);
  console.log(`  ${artifact.match_score.toFixed(2)} - "${artifact.name}" → "${masterArtifact.name}"`);
}
console.log('');

console.log('Sample new artifacts (top 5):');
const newArtifacts = extracted.artifacts.filter(a => !a.matched_id).slice(0, 5);
for (const artifact of newArtifacts) {
  console.log(`  - ${artifact.name} ($${(artifact.value / 1000000).toFixed(1)}M)`);
}
console.log('');

console.log(`✅ Updated ${extractedPath}`);
console.log('');
console.log('Next step: node merge-model-data.js ' + modelKey);
