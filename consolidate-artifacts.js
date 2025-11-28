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

// Define consolidation groups (12 high-confidence merges)
const consolidations = [
  {
    name: 'Mega-Deal M&A Sell-Side Advisory',
    keep: 'mega-deal-m-a-advisory-package',
    merge: ['m-a-sell-side-advisory-mandate-mega-deal'],
    canonicalName: 'Mega-Deal M&A Advisory Package (Sell-Side)'
  },
  {
    name: 'Phase III Clinical Trial',
    keep: 'clinical_trial_phase3',
    merge: ['phase-iii-clinical-trial-protocol-execution', 'phase-iii-clinical-trial-protocol-execution-1', 'clinical-trial-protocol-phase-iii-global']
  },
  {
    name: 'IPO S-1 Prospectus',
    keep: 'ipo_s1_registration',
    merge: ['ipo-prospectus-securities-offering-package', 'ipo-prospectus-s-1-drafting-readiness']
  },
  {
    name: 'PMA (Premarket Approval)',
    keep: 'pma_application',
    merge: ['pma-premarket-approval-submission-package', 'premarket-approval-pma-submission']
  },
  {
    name: '510(k) Medical Device',
    keep: 'medical_device_510k',
    merge: ['510-k-medical-device-submission', 'fda-510-k-premarket-notification']
  },
  {
    name: 'Chapter 11 Reorganization',
    keep: 'bankruptcy_restructuring',
    merge: ['complex-restructuring-chapter-11-advisory', 'bankruptcy-plan-of-reorganization-chapter-11']
  },
  {
    name: 'SOC 2 Type II Audit',
    keep: 'soc2_audit',
    merge: ['soc-2-type-ii-audit-report', 'soc-2-type-ii-readiness-audit-package-enterprise']
  },
  {
    name: 'NDA (New Drug Application)',
    keep: 'nda_bla_application',
    merge: ['fda-new-drug-application-nda-submission-dossier']
  },
  {
    name: 'Data Governance Framework',
    keep: 'data_governance',
    merge: ['data_governance_framework']
  },
  {
    name: 'Identity & Access Management',
    keep: 'identity_management',
    merge: ['identity_access_management']
  },
  {
    name: 'Highway/Bridge Design',
    keep: 'bridge-highway-design-package',
    merge: ['highway-bridge-detailed-design-package']
  },
  {
    name: 'Hedge Fund Formation',
    keep: 'hedge_fund_formation',
    merge: ['hedge_fund_setup']
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
