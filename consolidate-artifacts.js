#!/usr/bin/env node

/**
 * Artifact Consolidation Script
 * Merges duplicate artifacts identified in the redundancy audit
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('='.repeat(80));
console.log('ARTIFACT CONSOLIDATION SCRIPT');
console.log('='.repeat(80));
console.log('');

// Load master valuations
const masterPath = path.join(__dirname, 'dashboard/data/master_valuations.json');
const masterData = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

console.log(`Loaded ${masterData.artifacts.length} artifacts`);
console.log('');

// Create backup
const backupPath = path.join(__dirname, 'dashboard/data/backups', `master_valuations_pre_consolidation_${Date.now()}.json`);
const backupDir = path.join(__dirname, 'dashboard/data/backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}
fs.writeFileSync(backupPath, JSON.stringify(masterData, null, 2));
console.log(`✓ Backup created: ${backupPath}`);
console.log('');

// Define consolidation groups (6 total: single-model scale modifier cleanup)
const consolidations = [
  // GROUP 1: Digital Transformation (4→1)
  {
    name: 'Digital Transformation',
    keep: 'digital_transformation', // 10 models
    merge: [
      'smart-city-iot-pilot-design',
      'digital-twin-proof-of-concept',
      'smart-factory-iiot-roadmap'
    ],
    canonicalName: 'Digital Transformation Strategy'
  },

  // GROUP 2: Cybersecurity Assessment (3→1)
  {
    name: 'Cybersecurity Assessment',
    keep: 'cybersecurity_assessment', // 10 models
    merge: [
      'enterprise-zero-trust-security-architecture',
      'ransomware-readiness-assessment'
    ]
  },

  // GROUP 3: ESG/Sustainability (2→1)
  {
    name: 'ESG/Sustainability Report',
    keep: 'esg-sustainability-report', // 2 models
    merge: ['major-corporate-social-responsibility-csr-report'],
    canonicalName: 'ESG/Sustainability Report'
  },

  // GROUP 4: Corporate Communications (4→1)
  {
    name: 'Corporate Communications',
    keep: 'integrated-marketing-campaign', // 1 model
    merge: [
      'annual-report-design-production',
      'press-release-media-kit',
      'social-media-strategy'
    ],
    canonicalName: 'Corporate Communications Package'
  },

  // GROUP 5: Risk Assessment (2→1)
  {
    name: 'Risk Assessment',
    keep: 'risk-assessment-report', // 2 models
    merge: ['major-corporate-risk-assessment-report'],
    canonicalName: 'Corporate Risk Assessment Report'
  },

  // GROUP 6: Commercial Lease (2→1)
  {
    name: 'Commercial Lease',
    keep: 'commercial-lease-agreement-package', // 2 models
    merge: ['lease-agreement-commercial'],
    canonicalName: 'Commercial Lease Agreement'
  }
];

// Statistics
let totalMerged = 0;
let totalKept = 0;
const mergeLog = [];

// Process each consolidation group
consolidations.forEach((group, idx) => {
  console.log(`[${idx + 1}/${consolidations.length}] Processing: ${group.name}`);

  // Find the primary artifact to keep
  const primary = masterData.artifacts.find(a => a.id === group.keep);
  if (!primary) {
    console.log(`  ❌ ERROR: Primary artifact "${group.keep}" not found!`);
    return;
  }

  // Find and merge duplicate artifacts
  let mergedCount = 0;
  const mergedFromModels = [];

  group.merge.forEach(duplicateId => {
    const duplicate = masterData.artifacts.find(a => a.id === duplicateId);
    if (!duplicate) {
      console.log(`  ⚠ WARNING: Duplicate "${duplicateId}" not found, skipping`);
      return;
    }

    // Merge valuations from duplicate into primary
    Object.keys(duplicate.valuations).forEach(modelKey => {
      const value = duplicate.valuations[modelKey];
      if (value !== null && value !== undefined) {
        // Only merge if primary doesn't already have this model's valuation
        if (!primary.valuations[modelKey] || primary.valuations[modelKey] === null) {
          primary.valuations[modelKey] = value;
          mergedFromModels.push(modelKey);
        }
      }
    });

    mergedCount++;
  });

  // Update canonical name if provided
  if (group.canonicalName) {
    primary.name = group.canonicalName;
  }

  // Recalculate variance ratio for merged artifact
  const values = Object.values(primary.valuations).filter(v => v !== null && v > 0);
  if (values.length >= 2) {
    const max = Math.max(...values);
    const min = Math.min(...values);
    primary.variance_ratio = parseFloat((max / min).toFixed(2));
  }

  // Remove duplicates from artifacts array
  group.merge.forEach(duplicateId => {
    const index = masterData.artifacts.findIndex(a => a.id === duplicateId);
    if (index !== -1) {
      masterData.artifacts.splice(index, 1);
    }
  });

  console.log(`  ✓ Merged ${mergedCount} duplicate(s) into "${primary.name}"`);
  console.log(`    Models added: ${mergedFromModels.length > 0 ? mergedFromModels.join(', ') : 'none (no new valuations)'}`);
  console.log(`    Total models now: ${values.length}`);

  totalMerged += mergedCount;
  totalKept++;

  mergeLog.push({
    group: group.name,
    kept: group.keep,
    merged: mergedCount,
    totalModels: values.length
  });
});

console.log('');
console.log('='.repeat(80));
console.log('CONSOLIDATION COMPLETE');
console.log('='.repeat(80));
console.log(`Original artifact count: ${masterData.artifacts.length + totalMerged}`);
console.log(`Artifacts merged: ${totalMerged}`);
console.log(`Artifacts kept: ${totalKept}`);
console.log(`New artifact count: ${masterData.artifacts.length}`);
console.log(`Reduction: ${totalMerged} artifacts (${((totalMerged / (masterData.artifacts.length + totalMerged)) * 100).toFixed(1)}%)`);
console.log('');

// Save updated master valuations
fs.writeFileSync(masterPath, JSON.stringify(masterData, null, 2));
console.log(`✓ Updated master_valuations.json`);
console.log('');

// Generate consolidation report
const reportPath = path.join(__dirname, 'artifact_consolidation_report.txt');
const reportLines = [
  'ARTIFACT CONSOLIDATION REPORT',
  '='.repeat(80),
  '',
  `Date: ${new Date().toISOString()}`,
  `Original Count: ${masterData.artifacts.length + totalMerged}`,
  `Final Count: ${masterData.artifacts.length}`,
  `Reduction: ${totalMerged} artifacts (${((totalMerged / (masterData.artifacts.length + totalMerged)) * 100).toFixed(1)}%)`,
  '',
  'MERGED GROUPS:',
  '='.repeat(80),
  ''
];

mergeLog.forEach((entry, idx) => {
  reportLines.push(`${idx + 1}. ${entry.group}`);
  reportLines.push(`   Primary: ${entry.kept}`);
  reportLines.push(`   Merged: ${entry.merged} duplicate(s)`);
  reportLines.push(`   Total Models: ${entry.totalModels}`);
  reportLines.push('');
});

fs.writeFileSync(reportPath, reportLines.join('\n'));
console.log(`✓ Consolidation report saved: ${reportPath}`);
console.log('');

console.log('Next steps:');
console.log('  1. Review the updated dashboard: open dashboard/index.html');
console.log('  2. Verify artifact counts and model coverage');
console.log('  3. Commit changes: git add . && git commit -m "Consolidate duplicate artifacts"');
console.log('');
