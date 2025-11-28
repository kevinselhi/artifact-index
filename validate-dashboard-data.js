#!/usr/bin/env node

/**
 * Validate dashboard data integrity
 * Two modes:
 *   --extracted <file>  : Validate extracted model data before merge
 *   --full              : Validate complete master_valuations.json after merge
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Valid sectors from dashboard/js/constants.js INDUSTRY_COLORS + master_valuations.json
// Note: Some sectors in data are not in INDUSTRY_COLORS but are valid
const VALID_SECTORS = [
  'Medical/Pharma', 'Financial Services', 'Technology', 'Legal/Financial',
  'Management Consulting', 'Engineering', 'Real Estate', 'Environmental/Engineering',
  'Operations/Consulting', 'Legal/Compliance', 'Healthcare', 'Energy', 'Government',
  'Media/Entertainment', 'Telecommunications', 'Retail/Consumer', 'Manufacturing',
  'Agriculture', 'Legal',
  // Additional sectors found in master data:
  'Financial/Legal', 'Technology/Compliance', 'Tax/International',
  'HR Consulting', 'Architecture', 'Creative/Marketing', 'Environmental',
  'Marketing', 'Legal/Technology'
];

// Parse command line arguments
const args = process.argv.slice(2);
const mode = args[0];
const filePath = args[1];

if (!mode || (mode !== '--extracted' && mode !== '--full')) {
  console.error('Usage:');
  console.error('  node validate-dashboard-data.js --extracted <file>');
  console.error('  node validate-dashboard-data.js --full');
  console.error('');
  console.error('Examples:');
  console.error('  node validate-dashboard-data.js --extracted dashboard/data/extracted/model.json');
  console.error('  node validate-dashboard-data.js --full');
  process.exit(1);
}

if (mode === '--extracted' && !filePath) {
  console.error('ERROR: --extracted mode requires file path');
  process.exit(1);
}

// Validation state
let errors = [];
let warnings = [];

// Logging helpers
function logError(message) {
  errors.push(message);
  console.error(`❌ ${message}`);
}

function logWarning(message) {
  warnings.push(message);
  console.warn(`⚠️  ${message}`);
}

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

function logInfo(message) {
  console.log(`ℹ️  ${message}`);
}

// Mode 1: Validate extracted model data
async function validateExtracted(file) {
  console.log('='.repeat(70));
  console.log('Validating Extracted Model Data');
  console.log('='.repeat(70));
  console.log(`File: ${file}`);
  console.log('');

  // Check file exists
  if (!fs.existsSync(file)) {
    logError(`File not found: ${file}`);
    return false;
  }

  // Load and parse JSON
  let data;
  try {
    const content = fs.readFileSync(file, 'utf8');
    data = JSON.parse(content);
    logSuccess('JSON parsing successful');
  } catch (error) {
    logError(`JSON parse error: ${error.message}`);
    return false;
  }

  // Schema validation
  console.log('');
  console.log('Schema Validation:');
  console.log('─'.repeat(70));

  if (!data.model_key || typeof data.model_key !== 'string') {
    logError('Missing or invalid "model_key" field');
  } else {
    logSuccess(`model_key: "${data.model_key}"`);
  }

  if (!data.model_name || typeof data.model_name !== 'string') {
    logWarning('Missing or invalid "model_name" field');
  } else {
    logSuccess(`model_name: "${data.model_name}"`);
  }

  if (!data.methodology || typeof data.methodology !== 'string') {
    logWarning('Missing or invalid "methodology" field');
  }

  if (!Array.isArray(data.artifacts)) {
    logError('"artifacts" must be an array');
    return false;
  }

  if (data.artifacts.length === 0) {
    logError('artifacts array is empty');
    return false;
  }

  logSuccess(`Found ${data.artifacts.length} artifacts`);

  // Per-artifact validation
  console.log('');
  console.log('Artifact Validation:');
  console.log('─'.repeat(70));

  let matchedCount = 0;
  let highConfidenceCount = 0;
  const unknownSectors = new Set();

  for (let i = 0; i < data.artifacts.length; i++) {
    const artifact = data.artifacts[i];
    const prefix = `Artifact ${i + 1}`;

    // Name validation
    if (!artifact.name || typeof artifact.name !== 'string' || artifact.name.trim() === '') {
      logError(`${prefix}: Missing or empty "name"`);
    }

    // Value validation
    if (typeof artifact.value !== 'number') {
      logError(`${prefix} (${artifact.name}): "value" must be a number, got ${typeof artifact.value}`);
    } else if (artifact.value <= 0) {
      logError(`${prefix} (${artifact.name}): "value" must be positive, got ${artifact.value}`);
    } else if (!isFinite(artifact.value)) {
      logError(`${prefix} (${artifact.name}): "value" cannot be NaN or Infinity`);
    }

    // Sector validation
    if (!artifact.sector) {
      logError(`${prefix} (${artifact.name}): Missing "sector"`);
    } else if (!VALID_SECTORS.includes(artifact.sector)) {
      unknownSectors.add(artifact.sector);
    }

    // Confidence validation
    if (!['high', 'medium', 'low'].includes(artifact.confidence)) {
      logWarning(`${prefix} (${artifact.name}): Invalid confidence "${artifact.confidence}" (should be high/medium/low)`);
    } else if (artifact.confidence === 'high') {
      highConfidenceCount++;
    }

    // Matched ID tracking
    if (artifact.matched_id) {
      matchedCount++;
    }
  }

  // Sector warnings
  if (unknownSectors.size > 0) {
    console.log('');
    logWarning(`Unknown sectors found (not in INDUSTRY_COLORS):`);
    unknownSectors.forEach(sector => {
      console.log(`  - "${sector}"`);
    });
  }

  // Statistics
  console.log('');
  console.log('Statistics:');
  console.log('─'.repeat(70));
  const matchRate = ((matchedCount / data.artifacts.length) * 100).toFixed(1);
  const highConfRate = ((highConfidenceCount / data.artifacts.length) * 100).toFixed(1);

  logInfo(`Total artifacts: ${data.artifacts.length}`);
  logInfo(`Matched to existing IDs: ${matchedCount} (${matchRate}%)`);
  logInfo(`High confidence: ${highConfidenceCount} (${highConfRate}%)`);

  if (matchRate < 50) {
    logWarning(`Low match rate (${matchRate}%) - consider reviewing artifact name matching`);
  }

  return errors.length === 0;
}

// Mode 2: Validate full master data
async function validateFull() {
  console.log('='.repeat(70));
  console.log('Validating Master Dashboard Data');
  console.log('='.repeat(70));
  console.log('');

  const masterPath = path.join(__dirname, 'dashboard/data/master_valuations.json');
  const metadataPath = path.join(__dirname, 'dashboard/data/model_metadata.json');

  // Load master data
  let masterData;
  try {
    const content = fs.readFileSync(masterPath, 'utf8');
    masterData = JSON.parse(content);
    logSuccess('master_valuations.json loaded and parsed');
  } catch (error) {
    logError(`Failed to load master_valuations.json: ${error.message}`);
    return false;
  }

  // Load metadata
  let metadata;
  try {
    const content = fs.readFileSync(metadataPath, 'utf8');
    metadata = JSON.parse(content);
    logSuccess('model_metadata.json loaded and parsed');
  } catch (error) {
    logError(`Failed to load model_metadata.json: ${error.message}`);
    return false;
  }

  // Schema validation
  console.log('');
  console.log('Schema Validation:');
  console.log('─'.repeat(70));

  if (!Array.isArray(masterData.artifacts)) {
    logError('master_valuations.json: "artifacts" must be an array');
    return false;
  }

  if (masterData.artifacts.length === 0) {
    logError('master_valuations.json: artifacts array is empty');
    return false;
  }

  logSuccess(`Found ${masterData.artifacts.length} artifacts in master data`);

  if (!metadata.models || typeof metadata.models !== 'object') {
    logError('model_metadata.json: "models" object missing or invalid');
    return false;
  }

  const modelCount = Object.keys(metadata.models).length;
  logSuccess(`Found ${modelCount} models in metadata`);

  // ID validation
  console.log('');
  console.log('Artifact ID Validation:');
  console.log('─'.repeat(70));

  const seenIds = new Set();
  const invalidIds = [];

  for (const artifact of masterData.artifacts) {
    // ID format validation
    if (!artifact.id || typeof artifact.id !== 'string') {
      logError(`Artifact missing or invalid "id" field`);
      continue;
    }

    if (!/^[a-z0-9_]+$/.test(artifact.id)) {
      invalidIds.push(artifact.id);
    }

    // Duplicate check
    if (seenIds.has(artifact.id)) {
      logError(`Duplicate artifact ID: "${artifact.id}"`);
    }
    seenIds.add(artifact.id);

    // Required fields
    if (!artifact.name || typeof artifact.name !== 'string') {
      logError(`Artifact ${artifact.id}: Missing or invalid "name"`);
    }

    if (!artifact.sector || typeof artifact.sector !== 'string') {
      logError(`Artifact ${artifact.id}: Missing or invalid "sector"`);
    }

    if (!artifact.valuations || typeof artifact.valuations !== 'object') {
      logError(`Artifact ${artifact.id}: Missing or invalid "valuations" object`);
    }
  }

  if (invalidIds.length > 0) {
    logError(`${invalidIds.length} artifacts have invalid IDs (must be lowercase alphanumeric + underscores)`);
    invalidIds.slice(0, 5).forEach(id => {
      console.log(`  - "${id}"`);
    });
    if (invalidIds.length > 5) {
      console.log(`  ... and ${invalidIds.length - 5} more`);
    }
  } else {
    logSuccess('All artifact IDs valid');
  }

  // Valuations validation
  console.log('');
  console.log('Valuations Validation:');
  console.log('─'.repeat(70));

  let valuationErrors = 0;

  for (const artifact of masterData.artifacts) {
    if (!artifact.valuations) continue;

    for (const [modelKey, value] of Object.entries(artifact.valuations)) {
      if (value === null) continue; // null is valid (missing data)

      if (typeof value !== 'number') {
        logError(`${artifact.id}.valuations.${modelKey}: Must be number or null, got ${typeof value}`);
        valuationErrors++;
      } else if (value < 0) {
        logError(`${artifact.id}.valuations.${modelKey}: Cannot be negative (${value})`);
        valuationErrors++;
      } else if (!isFinite(value)) {
        logError(`${artifact.id}.valuations.${modelKey}: Cannot be NaN or Infinity`);
        valuationErrors++;
      }
    }
  }

  if (valuationErrors === 0) {
    logSuccess('All valuations valid');
  }

  // Variance ratio validation (CRITICAL)
  console.log('');
  console.log('Variance Ratio Validation (CRITICAL):');
  console.log('─'.repeat(70));

  let varianceErrors = 0;

  for (const artifact of masterData.artifacts) {
    const values = Object.values(artifact.valuations || {}).filter(v => v !== null && v > 0);

    // Calculate expected variance_ratio
    let expectedRatio = null;
    if (values.length >= 2) {
      const max = Math.max(...values);
      const min = Math.min(...values);
      expectedRatio = parseFloat((max / min).toFixed(2));
    }

    // Validate variance_ratio field
    if (values.length < 2) {
      // Should be null if fewer than 2 valuations
      if (artifact.variance_ratio !== null) {
        logError(`${artifact.id}: variance_ratio should be null (only ${values.length} valuation(s)), got ${artifact.variance_ratio}`);
        varianceErrors++;
      }
    } else {
      // Should be a number >= 1.0
      if (typeof artifact.variance_ratio !== 'number') {
        logError(`${artifact.id}: variance_ratio must be a number, got ${typeof artifact.variance_ratio}`);
        varianceErrors++;
      } else if (!isFinite(artifact.variance_ratio)) {
        logError(`${artifact.id}: variance_ratio cannot be NaN or Infinity`);
        varianceErrors++;
      } else if (artifact.variance_ratio < 1.0) {
        logError(`${artifact.id}: variance_ratio cannot be < 1.0, got ${artifact.variance_ratio}`);
        varianceErrors++;
      } else {
        // Check if calculated ratio matches (with tolerance for rounding)
        const diff = Math.abs(artifact.variance_ratio - expectedRatio);
        if (diff > 0.01) {
          logError(`${artifact.id}: variance_ratio mismatch - expected ${expectedRatio}, got ${artifact.variance_ratio}`);
          varianceErrors++;
        }
      }
    }
  }

  if (varianceErrors === 0) {
    logSuccess('All variance ratios valid and correctly calculated');
  } else {
    logError(`Found ${varianceErrors} variance ratio errors (CRITICAL - will break dashboard)`);
  }

  // Sector validation
  console.log('');
  console.log('Sector Validation:');
  console.log('─'.repeat(70));

  const unknownSectors = new Set();
  for (const artifact of masterData.artifacts) {
    if (artifact.sector && !VALID_SECTORS.includes(artifact.sector)) {
      unknownSectors.add(artifact.sector);
    }
  }

  if (unknownSectors.size > 0) {
    logWarning(`${unknownSectors.size} artifacts have unknown sectors (bubble chart may show incorrect colors)`);
    unknownSectors.forEach(sector => {
      console.log(`  - "${sector}"`);
    });
  } else {
    logSuccess('All sectors recognized');
  }

  // Model metadata cross-reference
  console.log('');
  console.log('Model Metadata Cross-Reference:');
  console.log('─'.repeat(70));

  // Get all model keys from valuations
  const modelsInValuations = new Set();
  for (const artifact of masterData.artifacts) {
    Object.keys(artifact.valuations || {}).forEach(key => modelsInValuations.add(key));
  }

  // Get all model keys from metadata
  const modelsInMetadata = new Set(Object.keys(metadata.models));

  // Check for missing metadata
  const missingMetadata = [...modelsInValuations].filter(m => !modelsInMetadata.has(m));
  if (missingMetadata.length > 0) {
    logError(`Models in valuations but missing from metadata:`);
    missingMetadata.forEach(m => console.log(`  - ${m}`));
  }

  // Check for orphaned metadata
  const orphanedMetadata = [...modelsInMetadata].filter(m => !modelsInValuations.has(m));
  if (orphanedMetadata.length > 0) {
    logWarning(`Models in metadata but not in valuations (may be new):`);
    orphanedMetadata.forEach(m => console.log(`  - ${m}`));
  }

  if (missingMetadata.length === 0 && orphanedMetadata.length === 0) {
    logSuccess('Model metadata and valuations in sync');
  }

  return errors.length === 0;
}

// Main execution
async function main() {
  let success;

  if (mode === '--extracted') {
    success = await validateExtracted(filePath);
  } else {
    success = await validateFull();
  }

  // Summary
  console.log('');
  console.log('='.repeat(70));
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(70));

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All checks passed!');
    process.exit(0);
  } else {
    console.log(`❌ Errors: ${errors.length}`);
    console.log(`⚠️  Warnings: ${warnings.length}`);
    console.log('');

    if (errors.length > 0) {
      console.log('VALIDATION FAILED');
      process.exit(1);
    } else {
      console.log('VALIDATION PASSED (with warnings)');
      process.exit(0);
    }
  }
}

main();
