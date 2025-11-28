#!/usr/bin/env node

/**
 * Extract artifact valuations from an AI model report
 * Uses Claude to parse unstructured reports and extract structured data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node extract-model-data.js <report-file> <model-key>');
  console.error('');
  console.error('Examples:');
  console.error('  node extract-model-data.js artifact_index_2020_claude_opus_45.md claude_opus45');
  console.error('  node extract-model-data.js report.pdf gpt5_deep_research');
  console.error('');
  process.exit(1);
}

const [reportFile, modelKey] = args;

// Validate report file exists
const reportPath = path.resolve(reportFile);
if (!fs.existsSync(reportPath)) {
  console.error(`ERROR: Report file not found: ${reportPath}`);
  process.exit(1);
}

// Validate model key format
if (!/^[a-z0-9_]+$/.test(modelKey)) {
  console.error('ERROR: Model key must contain only lowercase letters, numbers, and underscores');
  console.error(`Invalid: "${modelKey}"`);
  process.exit(1);
}

console.log('='.repeat(70));
console.log('AI Model Data Extraction');
console.log('='.repeat(70));
console.log(`Report file: ${reportPath}`);
console.log(`Model key: ${modelKey}`);
console.log('');

// Initialize Claude
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('ERROR: ANTHROPIC_API_KEY environment variable not set');
  console.error('Set it with: export ANTHROPIC_API_KEY="your-api-key"');
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey });

// Load the report
console.log('Reading report file...');
const reportContent = fs.readFileSync(reportPath, 'utf8');
console.log(`✓ Loaded ${reportContent.length} characters`);
console.log('');

// Load existing artifact data for reference
const masterPath = path.join(__dirname, 'dashboard/data/master_valuations.json');
const masterData = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

// Create reference list of existing artifacts
const existingArtifacts = masterData.artifacts.map(a => ({
  id: a.id,
  name: a.name,
  sector: a.sector
}));

// Extraction prompt
const extractionPrompt = `You are analyzing an AI model's research report on professional artifact valuations from 2020.

Your task is to extract structured data from this report in JSON format.

EXISTING ARTIFACTS IN DATABASE:
${JSON.stringify(existingArtifacts, null, 2)}

REPORT TO ANALYZE:
${reportContent}

EXTRACTION REQUIREMENTS:

1. Extract ALL artifacts mentioned in the report with their valuations
2. For each artifact, provide:
   - name: The artifact name as written in the report
   - value: The numeric valuation in USD (convert to single number, e.g., "$5M" → 5000000)
   - sector: The industry sector (e.g., "Medical/Pharma", "Financial Services", "Technology")
   - matched_id: The ID from EXISTING ARTIFACTS that best matches this artifact (or null if no match)
   - confidence: Your confidence in the match (high/medium/low)

3. VALUE EXTRACTION RULES:
   - If a range is given (e.g., "$5M-$10M"), use the midpoint ($7.5M)
   - If "up to X" is stated, use X
   - If multiple values, use the most representative one
   - Convert all to plain numbers (no currency symbols, no abbreviations)
   - $1M = 1000000, $1B = 1000000000

4. MATCHING RULES:
   - Match to existing artifact IDs when possible
   - Account for name variations (e.g., "Phase 3 Trial" = "Phase III Clinical Trial")
   - If unsure about a match, set matched_id to null

5. OUTPUT FORMAT:

Return ONLY valid JSON in this exact structure:
{
  "model_key": "${modelKey}",
  "model_name": "Full Model Name (extract from report)",
  "methodology": "Brief summary of how this model approached valuations",
  "artifacts": [
    {
      "name": "Artifact Name",
      "value": 1000000,
      "sector": "Sector Name",
      "matched_id": "existing_artifact_id or null",
      "confidence": "high/medium/low"
    }
  ]
}

IMPORTANT:
- Return ONLY the JSON object, no other text
- Ensure all values are numbers, not strings
- Include ALL artifacts from the report, even if you're unsure about matches
- If the report doesn't clearly state a methodology, make your best inference
`;

// Call Claude to extract data
console.log('Extracting data with Claude...');
console.log('This may take 30-60 seconds for large reports...');
console.log('');

async function extractData() {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 16000,
      messages: [{
        role: 'user',
        content: extractionPrompt
      }]
    });

    const responseText = message.content[0].text;

    // Try to parse JSON from response
    let extractedData;
    try {
      // Sometimes Claude wraps JSON in markdown code blocks
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) ||
                       responseText.match(/```\n([\s\S]*?)\n```/) ||
                       [null, responseText];

      extractedData = JSON.parse(jsonMatch[1] || responseText);
    } catch (parseError) {
      console.error('ERROR: Could not parse Claude\'s response as JSON');
      console.error('Response:', responseText.substring(0, 500));
      throw parseError;
    }

    // Validate structure
    if (!extractedData.artifacts || !Array.isArray(extractedData.artifacts)) {
      throw new Error('Extracted data missing "artifacts" array');
    }

    console.log('✓ Extraction complete!');
    console.log('');
    console.log('Results:');
    console.log(`  Model: ${extractedData.model_name || modelKey}`);
    console.log(`  Artifacts extracted: ${extractedData.artifacts.length}`);
    console.log(`  Matched to existing: ${extractedData.artifacts.filter(a => a.matched_id).length}`);
    console.log(`  High confidence matches: ${extractedData.artifacts.filter(a => a.confidence === 'high').length}`);
    console.log('');

    // Show top 10 artifacts
    const sorted = [...extractedData.artifacts].sort((a, b) => b.value - a.value);
    console.log('Top 10 Artifacts by Value:');
    console.log('─'.repeat(70));
    sorted.slice(0, 10).forEach((artifact, i) => {
      const value = artifact.value ? `$${(artifact.value / 1000000).toFixed(1)}M` : 'N/A';
      const match = artifact.matched_id ? `✓ ${artifact.matched_id}` : '✗ No match';
      console.log(`${(i+1).toString().padStart(2)}. ${artifact.name.padEnd(40)} ${value.padStart(10)} ${match}`);
    });
    console.log('');

    // Create output directory
    const extractedDir = path.join(__dirname, 'dashboard/data/extracted');
    if (!fs.existsSync(extractedDir)) {
      fs.mkdirSync(extractedDir, { recursive: true });
    }

    // Save extracted data
    const outputPath = path.join(extractedDir, `${modelKey}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(extractedData, null, 2));

    console.log('✓ Data saved to:', outputPath);
    console.log('');
    console.log('Next steps:');
    console.log('  1. Review the extracted data file');
    console.log('  2. Make any manual corrections if needed');
    console.log('  3. Add model metadata to dashboard/data/model_metadata.json');
    console.log(`  4. Run: node merge-model-data.js ${modelKey}`);
    console.log('');

  } catch (error) {
    console.error('ERROR during extraction:', error.message);
    if (error.response) {
      console.error('API Error:', error.response.data);
    }
    process.exit(1);
  }
}

extractData();
