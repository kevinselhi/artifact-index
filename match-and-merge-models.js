#!/usr/bin/env node

/**
 * Match new model artifacts to existing IDs and merge into dashboard
 * Handles both Claude Opus CLI and You-ARI models
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load master valuations
const masterPath = path.join(__dirname, 'dashboard/data/master_valuations.json');
const masterData = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

// Load extracted data
const claudePath = path.join(__dirname, 'dashboard/data/extracted/claude_opus45_cli.json');
const youPath = path.join(__dirname, 'dashboard/data/extracted/you_ari.json');

const claudeData = JSON.parse(fs.readFileSync(claudePath, 'utf8'));
const youData = JSON.parse(fs.readFileSync(youPath, 'utf8'));

console.log('Matching artifacts to existing IDs...\n');

// Simple string similarity function
function similarity(s1, s2) {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1.0;

  const editDistance = (s1, s2) => {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  };

  return (longer.length - editDistance(longer, shorter)) / longer.length;
}

// Match function
function findBestMatch(artifactName, masterArtifacts) {
  let bestMatch = null;
  let bestScore = 0;

  for (const master of masterArtifacts) {
    const score = similarity(artifactName.toLowerCase(), master.name.toLowerCase());
    if (score > bestScore && score > 0.6) { // 60% similarity threshold
      bestScore = score;
      bestMatch = master;
    }
  }

  return { match: bestMatch, score: bestScore };
}

// Process Claude Opus CLI
console.log('Processing Claude Opus CLI artifacts...');
let claudeMatched = 0;
for (const artifact of claudeData.artifacts) {
  const { match, score } = findBestMatch(artifact.name, masterData.artifacts);
  if (match) {
    artifact.matched_id = match.id;
    artifact.match_confidence = score > 0.9 ? 'high' : score > 0.75 ? 'medium' : 'low';
    claudeMatched++;
    console.log(`  ✓ ${artifact.name} → ${match.id} (${(score * 100).toFixed(0)}%)`);
  } else {
    artifact.matched_id = null;
    console.log(`  ✗ ${artifact.name} - NO MATCH`);
  }
}

// Process You-ARI
console.log('\nProcessing You-ARI artifacts...');
let youMatched = 0;
for (const artifact of youData.artifacts) {
  const { match, score } = findBestMatch(artifact.name, masterData.artifacts);
  if (match) {
    artifact.matched_id = match.id;
    artifact.match_confidence = score > 0.9 ? 'high' : score > 0.75 ? 'medium' : 'low';
    youMatched++;
    console.log(`  ✓ ${artifact.name} → ${match.id} (${(score * 100).toFixed(0)}%)`);
  } else {
    artifact.matched_id = null;
    console.log(`  ✗ ${artifact.name} - NO MATCH`);
  }
}

// Save updated extractions
fs.writeFileSync(claudePath, JSON.stringify(claudeData, null, 2));
fs.writeFileSync(youPath, JSON.stringify(youData, null, 2));

console.log('\n' + '='.repeat(70));
console.log('MATCHING COMPLETE');
console.log('='.repeat(70));
console.log(`Claude Opus CLI: ${claudeMatched}/${claudeData.artifacts.length} matched`);
console.log(`You-ARI: ${youMatched}/${youData.artifacts.length} matched`);
console.log('\nUpdated files saved. Ready to merge!');
console.log('\nNext steps:');
console.log('  node merge-model-data.js claude_opus45_cli');
console.log('  node merge-model-data.js you_ari');
