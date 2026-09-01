#!/usr/bin/env npx ts-node --esm
/**
 * Report Generation Agent
 *
 * A simple agent that:
 * 1. Prompts AI models to generate artifact valuation reports
 * 2. Parses the markdown output to extract valuations
 * 3. Loads results into master_valuations.json
 *
 * Usage:
 *   npx ts-node --esm report-generation-agent.ts generate --model claude
 *   npx ts-node --esm report-generation-agent.ts parse ./reports/new_report.md --model-id my_model
 *   npx ts-node --esm report-generation-agent.ts load ./reports/new_report.md --model-id my_model
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const MASTER_VALUATIONS_PATH = './dashboard/data/master_valuations.json';
const MODEL_METADATA_PATH = './dashboard/data/model_metadata.json';
const REPORTS_DIR = './reports';

// Model configurations for API calls
const MODEL_CONFIGS: Record<string, {
  provider: 'anthropic' | 'openai' | 'google' | 'perplexity';
  modelId: string;
  apiKeyEnv: string;
  displayName: string;
  color: string;
}> = {
  'claude_sonnet45': {
    provider: 'anthropic',
    modelId: 'claude-sonnet-4-5-20250929',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    displayName: 'Claude Sonnet 4.5',
    color: '#E07A5F'
  },
  'claude_opus45': {
    provider: 'anthropic',
    modelId: 'claude-opus-4-5-20251101',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    displayName: 'Claude Opus 4.5',
    color: '#81B29A'
  },
  'chatgpt5': {
    provider: 'openai',
    modelId: 'gpt-4o',
    apiKeyEnv: 'OPENAI_API_KEY',
    displayName: 'ChatGPT 5',
    color: '#FF6B6B'
  },
  'gemini': {
    provider: 'google',
    modelId: 'gemini-2.5-pro',
    apiKeyEnv: 'GOOGLE_API_KEY',
    displayName: 'Gemini 2.5 Pro',
    color: '#4285F4'
  }
};

// ============================================================================
// PROMPT TEMPLATE (based on existing TopArtifiact_System Prompt_v2.md)
// ============================================================================

const SYSTEM_PROMPT = `You are an expert research analyst creating "The 2020 Human Artifact Index" - a comprehensive catalog of the most economically valuable professional deliverables created in calendar year 2020.

TASK: Identify and rank the top 100 most valuable artifact types that professional teams created in 2020.

DEFINITIONS:
- Artifact Type: A category of professional B2B deliverable (e.g., "Phase III Clinical Trial Protocol", "M&A Due Diligence Report")
- Value: Typical billing/project value in USD for 2020

INCLUSION CRITERIA:
- Professional B2B or institutional deliverables
- Created by teams with specialized expertise
- Has measurable economic/billing value
- Was actively produced in 2020

EXCLUSION CRITERIA:
- Physical products or manufactured goods
- Consumer-facing services
- Internal documents without billing value

REQUIRED SECTORS (cover all):
1. Financial Services (M&A, restructuring, valuations)
2. Legal Services (litigation, IP, corporate law)
3. Medical/Pharmaceutical (clinical trials, FDA submissions)
4. Management Consulting (strategy, operations, IT)
5. Engineering (civil, mechanical, software)
6. Architecture/Construction
7. Creative/Marketing Services
8. Technology Services (software, cybersecurity, cloud)
9. Real Estate
10. Environmental/Regulatory
11. Scientific Research/R&D

OUTPUT FORMAT - Provide a markdown table with exactly these columns:
| Rank | Artifact Name | Sector | Typical Value (USD) | Producer Type |

IMPORTANT:
- Provide exactly 100 artifacts
- Use specific, industry-standard names
- Values should reflect 2020 market rates
- Include value as a single number (midpoint if range)
- Cover all 11+ sectors listed above

After the table, include:
1. Brief methodology explanation (2-3 sentences)
2. Top 5 sectors by total value
3. Any COVID-19 impacts noted`;

// ============================================================================
// PARSER - Extract valuations from markdown tables
// ============================================================================

interface ParsedArtifact {
  rank: number;
  name: string;
  sector: string;
  value: number;
  producerType?: string;
}

function parseMarkdownReport(markdown: string): ParsedArtifact[] {
  const artifacts: ParsedArtifact[] = [];

  // Detect if values are in thousands (USD K)
  const isThousands = /USD\s*K|Value\s*\(.*K\)/i.test(markdown);
  const multiplier = isThousands ? 1000 : 1;

  // Match markdown tables with pipe separators
  const tableRegex = /\|[^\n]+\|/g;
  const rows = markdown.match(tableRegex) || [];

  for (const row of rows) {
    // Skip header, separator, and placeholder rows
    if (row.includes('---') || row.toLowerCase().includes('rank') ||
        row.includes('…') || row.includes('...')) continue;

    const cells = row.split('|').map(c => c.trim()).filter(c => c);
    if (cells.length < 4) continue;

    // Try to parse: Rank/# | Name | Sector | Value | [extra columns]
    const rank = parseInt(cells[0].replace('#', ''));
    if (isNaN(rank) || rank < 1 || rank > 200) continue;

    const name = cells[1];
    const sector = cells[2];
    const valueStr = cells[3];
    const producerType = cells.length > 4 ? cells[4] : undefined;

    // Parse value - handle space separators like "2 200"
    const cleanedValue = valueStr.replace(/\s+/g, '');
    const value = parseValue(cleanedValue);
    if (!value || value < 10) continue; // Skip invalid values

    artifacts.push({
      rank,
      name,
      sector,
      value: value * multiplier,
      producerType
    });
  }

  return artifacts;
}

function parseValue(valueStr: string): number | null {
  if (!valueStr) return null;

  // Remove common prefixes/suffixes and clean up
  let cleaned = valueStr
    .replace(/\$/g, '')
    .replace(/USD/gi, '')
    .replace(/,/g, '')
    .replace(/\s+/g, '')
    .trim();

  // Handle millions (1.5M, 1.5 million)
  const millionMatch = cleaned.match(/^([\d.]+)\s*[Mm](illion)?$/);
  if (millionMatch) {
    return parseFloat(millionMatch[1]) * 1_000_000;
  }

  // Handle thousands (500K, 500 thousand)
  const thousandMatch = cleaned.match(/^([\d.]+)\s*[Kk](thousand)?$/);
  if (thousandMatch) {
    return parseFloat(thousandMatch[1]) * 1_000;
  }

  // Handle range (take midpoint): "100,000-500,000" or "100K-500K"
  const rangeMatch = cleaned.match(/^([\d.]+[KkMm]?)\s*[-–]\s*([\d.]+[KkMm]?)$/);
  if (rangeMatch) {
    const low = parseValue(rangeMatch[1]);
    const high = parseValue(rangeMatch[2]);
    if (low && high) return (low + high) / 2;
  }

  // Plain number
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function normalizeId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 50);
}

// ============================================================================
// LOADER - Update master_valuations.json
// ============================================================================

interface MasterArtifact {
  id: string;
  name: string;
  sector: string;
  valuations: Record<string, number | null>;
  variance_ratio: number;
}

interface MasterValuations {
  artifacts: MasterArtifact[];
}

function loadMasterValuations(): MasterValuations {
  const content = fs.readFileSync(MASTER_VALUATIONS_PATH, 'utf-8');
  return JSON.parse(content);
}

function saveMasterValuations(data: MasterValuations): void {
  fs.writeFileSync(MASTER_VALUATIONS_PATH, JSON.stringify(data, null, 2));
}

function calculateVarianceRatio(valuations: Record<string, number | null>): number {
  const values = Object.values(valuations).filter((v): v is number => v !== null && v > 0);
  if (values.length < 2) return 1;

  const min = Math.min(...values);
  const max = Math.max(...values);
  return Math.round((max / min) * 100) / 100;
}

function loadReportIntoMaster(
  artifacts: ParsedArtifact[],
  modelId: string
): { added: number; updated: number } {
  const master = loadMasterValuations();
  let added = 0;
  let updated = 0;

  // Create lookup by normalized ID
  const existingById = new Map<string, MasterArtifact>();
  for (const artifact of master.artifacts) {
    existingById.set(artifact.id, artifact);
  }

  for (const parsed of artifacts) {
    const id = normalizeId(parsed.name);
    const existing = existingById.get(id);

    if (existing) {
      // Update existing artifact with new model's valuation
      existing.valuations[modelId] = parsed.value;
      existing.variance_ratio = calculateVarianceRatio(existing.valuations);
      updated++;
    } else {
      // Add new artifact
      const newArtifact: MasterArtifact = {
        id,
        name: parsed.name,
        sector: parsed.sector,
        valuations: { [modelId]: parsed.value },
        variance_ratio: 1
      };
      master.artifacts.push(newArtifact);
      existingById.set(id, newArtifact);
      added++;
    }
  }

  saveMasterValuations(master);
  return { added, updated };
}

// ============================================================================
// GENERATOR - Call AI APIs to generate reports
// ============================================================================

async function generateReport(modelKey: string): Promise<string> {
  const config = MODEL_CONFIGS[modelKey];
  if (!config) {
    throw new Error(`Unknown model: ${modelKey}. Available: ${Object.keys(MODEL_CONFIGS).join(', ')}`);
  }

  const apiKey = process.env[config.apiKeyEnv];
  if (!apiKey) {
    throw new Error(`Missing API key: Set ${config.apiKeyEnv} environment variable`);
  }

  console.log(`Generating report with ${config.displayName}...`);

  let response: string;

  switch (config.provider) {
    case 'anthropic':
      response = await callAnthropic(apiKey, config.modelId, SYSTEM_PROMPT);
      break;
    case 'openai':
      response = await callOpenAI(apiKey, config.modelId, SYSTEM_PROMPT);
      break;
    case 'google':
      response = await callGoogle(apiKey, config.modelId, SYSTEM_PROMPT);
      break;
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }

  return response;
}

async function callAnthropic(apiKey: string, model: string, prompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!res.ok) {
    throw new Error(`Anthropic API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

async function callOpenAI(apiKey: string, model: string, prompt: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      messages: [
        { role: 'system', content: 'You are an expert research analyst.' },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

async function callGoogle(apiKey: string, model: string, prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 8192 }
      })
    }
  );

  if (!res.ok) {
    throw new Error(`Google API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help' || command === '--help') {
    console.log(`
Report Generation Agent - Generate and load AI artifact valuations

Commands:
  generate --model <key>          Generate a new report using an AI model
  parse <file> --model-id <id>    Parse a markdown report and show extracted data
  load <file> --model-id <id>     Parse and load a report into master_valuations.json
  list-models                     Show available model configurations
  prompt                          Print the system prompt template

Examples:
  npx ts-node --esm report-generation-agent.ts generate --model claude_sonnet45
  npx ts-node --esm report-generation-agent.ts parse ./reports/new_model.md --model-id new_model
  npx ts-node --esm report-generation-agent.ts load ./o3pro_HumanArtivactsReport_v4.md --model-id o3pro

Environment Variables:
  ANTHROPIC_API_KEY   For Claude models
  OPENAI_API_KEY      For GPT models
  GOOGLE_API_KEY      For Gemini models
`);
    return;
  }

  switch (command) {
    case 'generate': {
      const modelIdx = args.indexOf('--model');
      const modelKey = modelIdx >= 0 ? args[modelIdx + 1] : 'claude_sonnet45';

      if (!fs.existsSync(REPORTS_DIR)) {
        fs.mkdirSync(REPORTS_DIR, { recursive: true });
      }

      const markdown = await generateReport(modelKey);
      const outputPath = path.join(REPORTS_DIR, `${modelKey}_report_${Date.now()}.md`);
      fs.writeFileSync(outputPath, markdown);
      console.log(`Report saved to: ${outputPath}`);

      const artifacts = parseMarkdownReport(markdown);
      console.log(`Parsed ${artifacts.length} artifacts`);
      break;
    }

    case 'parse': {
      const filePath = args[1];
      if (!filePath || !fs.existsSync(filePath)) {
        console.error('Please provide a valid file path');
        process.exit(1);
      }

      const markdown = fs.readFileSync(filePath, 'utf-8');
      const artifacts = parseMarkdownReport(markdown);

      console.log(`\nParsed ${artifacts.length} artifacts:\n`);
      console.log('Rank | Name | Sector | Value');
      console.log('-----|------|--------|------');
      for (const a of artifacts.slice(0, 20)) {
        console.log(`${a.rank} | ${a.name.substring(0, 40)} | ${a.sector} | $${a.value.toLocaleString()}`);
      }
      if (artifacts.length > 20) {
        console.log(`... and ${artifacts.length - 20} more`);
      }
      break;
    }

    case 'load': {
      const filePath = args[1];
      const modelIdIdx = args.indexOf('--model-id');
      const modelId = modelIdIdx >= 0 ? args[modelIdIdx + 1] : null;

      if (!filePath || !fs.existsSync(filePath)) {
        console.error('Please provide a valid file path');
        process.exit(1);
      }
      if (!modelId) {
        console.error('Please provide --model-id <id>');
        process.exit(1);
      }

      const markdown = fs.readFileSync(filePath, 'utf-8');
      const artifacts = parseMarkdownReport(markdown);

      console.log(`Parsed ${artifacts.length} artifacts from ${filePath}`);

      const result = loadReportIntoMaster(artifacts, modelId);
      console.log(`Loaded into master_valuations.json:`);
      console.log(`  - Added: ${result.added} new artifacts`);
      console.log(`  - Updated: ${result.updated} existing artifacts`);
      break;
    }

    case 'list-models': {
      console.log('\nAvailable model configurations:\n');
      for (const [key, config] of Object.entries(MODEL_CONFIGS)) {
        console.log(`  ${key}`);
        console.log(`    Provider: ${config.provider}`);
        console.log(`    Model: ${config.modelId}`);
        console.log(`    API Key: ${config.apiKeyEnv}`);
        console.log('');
      }
      break;
    }

    case 'prompt': {
      console.log(SYSTEM_PROMPT);
      break;
    }

    default:
      console.error(`Unknown command: ${command}. Run with 'help' for usage.`);
      process.exit(1);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
