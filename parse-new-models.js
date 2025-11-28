#!/usr/bin/env node

/**
 * Parse Claude Opus CLI and You-ARI model reports
 * Extracts valuations and matches to existing artifacts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Parsing new model data...\n');

// Load master valuations to get existing artifacts
const masterPath = path.join(__dirname, 'dashboard/data/master_valuations.json');
const masterData = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

// Claude Opus CLI - Top artifacts with values (from the markdown table)
const claudeOpusCLI = {
  model_key: "claude_opus45_cli",
  model_name: "Claude 4.5 Opus (CLI with Extended Thinking)",
  methodology: "Web-based research with Extended Thinking mode via Claude Code CLI. Mid-point of stated ranges, cross-referenced with multiple authoritative sources, adjusted for 2020 market conditions.",
  artifacts: [
    { name: "Mega-Deal M&A Advisory Package", value: 85000000, sector: "Financial Services", confidence: "high" },
    { name: "Phase III Clinical Trial Protocol & Execution", value: 36500000, sector: "Medical/Pharmaceutical", confidence: "high" },
    { name: "Large-Scale ERP Implementation", value: 7500000, sector: "Technology", confidence: "high" },
    { name: "IPO Prospectus & Securities Offering Package", value: 10000000, sector: "Financial Services", confidence: "high" },
    { name: "Complex Restructuring/Chapter 11 Advisory", value: 27500000, sector: "Financial Services", confidence: "high" },
    { name: "New Drug Application (NDA) Package", value: 4000000, sector: "Medical/Pharmaceutical", confidence: "high" },
    { name: "Enterprise Strategy Consulting Engagement", value: 3250000, sector: "Management Consulting", confidence: "high" },
    { name: "Major Environmental Impact Statement", value: 43000000, sector: "Environmental", confidence: "medium" },
    { name: "Patent Litigation Complete Case Package", value: 3150000, sector: "Legal Services", confidence: "high" },
    { name: "Large Corporate Due Diligence Report", value: 1250000, sector: "Financial Services", confidence: "high" },
    // Continuing with more values...
    { name: "PMA (Premarket Approval) Submission Package", value: 1250000, sector: "Medical/Pharmaceutical", confidence: "high" },
    { name: "Complex M&A Advisory (Mid-Market)", value: 2000000, sector: "Financial Services", confidence: "high" },
    { name: "Municipal Bond Offering Package", value: 1250000, sector: "Financial Services", confidence: "medium" },
    { name: "Enterprise Cloud Migration Project", value: 425000, sector: "Technology", confidence: "high" },
    { name: "Fairness Opinion", value: 1100000, sector: "Financial Services", confidence: "high" },
    { name: "Digital Transformation Strategy", value: 1250000, sector: "Management Consulting", confidence: "high" },
    { name: "AI/ML Enterprise Implementation", value: 1250000, sector: "Technology", confidence: "medium" },
    { name: "510(k) Medical Device Submission", value: 300000, sector: "Medical/Pharmaceutical", confidence: "high" },
    { name: "Complex Merger Proxy Statement", value: 650000, sector: "Legal Services", confidence: "high" },
    { name: "S&P 500 Annual Audit", value: 44000000, sector: "Financial Services", confidence: "high" },
    { name: "Phase II Clinical Trial Protocol", value: 16500000, sector: "Medical/Pharmaceutical", confidence: "high" },
    { name: "Large Infrastructure Engineering Design", value: 3000000, sector: "Engineering", confidence: "medium" },
    { name: "Operations Transformation Project", value: 1000000, sector: "Management Consulting", confidence: "high" },
    { name: "Comprehensive Tax Opinion Package", value: 600000, sector: "Financial Services", confidence: "high" },
    { name: "Quality of Earnings Report (Large Deal)", value: 100000, sector: "Financial Services", confidence: "high" }
  ]
};

// You-ARI - Top artifacts with values (from CSV)
const youARI = {
  model_key: "you_ari",
  model_name: "You.com ARI (Advanced Research Intelligence)",
  methodology: "Triangulated data from professional service firm reports, industry analyst research, regulatory filings, and market research specific to 2020. Typical billing ranges for single artifact instances.",
  artifacts: [
    { name: "M&A Sell-Side Advisory Mandate (Mega-Deal)", value: 70000000, sector: "Financial Services", confidence: "high" },
    { name: "M&A Buy-Side Advisory Mandate (Mega-Deal)", value: 52500000, sector: "Financial Services", confidence: "high" },
    { name: "IPO Underwriting Syndicate Book (Large Cap)", value: 42500000, sector: "Financial Services", confidence: "high" },
    { name: "Corporate Restructuring Advisory (Large Cap)", value: 27500000, sector: "Financial Services", confidence: "high" },
    { name: "Bankruptcy Plan of Reorganization (Chapter 11)", value: 16000000, sector: "Financial Services", confidence: "high" },
    { name: "Fairness Opinion (Mega-Deal)", value: 5500000, sector: "Financial Services", confidence: "high" },
    { name: "Private Equity Due Diligence Report (Large Cap)", value: 3000000, sector: "Financial Services", confidence: "high" },
    { name: "Clinical Trial Protocol (Phase III, Global)", value: 3000000, sector: "Medical/Pharmaceutical", confidence: "high" },
    { name: "Antitrust/Competition Analysis (Mega-Deal)", value: 3000000, sector: "Legal Services", confidence: "high" },
    { name: "Investment Banking Pitch Book (Mega-Deal)", value: 3000000, sector: "Financial Services", confidence: "high" },
    { name: "Enterprise Digital Transformation Roadmap", value: 3250000, sector: "Management Consulting", confidence: "high" },
    { name: "New Drug Application (NDA) Dossier", value: 2500000, sector: "Medical/Pharmaceutical", confidence: "high" },
    { name: "Biologics License Application (BLA) Dossier", value: 2500000, sector: "Medical/Pharmaceutical", confidence: "high" },
    { name: "Premarket Approval (PMA) Submission", value: 1750000, sector: "Medical/Pharmaceutical", confidence: "high" },
    { name: "Phase III Clinical Trial Protocol & Execution", value: 1500000, sector: "Medical/Pharmaceutical", confidence: "high" },
    { name: "M&A Due Diligence Report", value: 1250000, sector: "Financial Services", confidence: "high" },
    { name: "Enterprise Cloud Migration Blueprint", value: 1375000, sector: "Technology", confidence: "high" },
    { name: "Major Transportation Corridor Design Package", value: 950000, sector: "Engineering", confidence: "high" },
    { name: "Regulatory Compliance Assessment (Banking/Healthcare)", value: 800000, sector: "Technology", confidence: "high" },
    { name: "Large-Scale Architectural Design & Construction Docs", value: 725000, sector: "Architecture", confidence: "high" },
    { name: "Global Brand Strategy & Positioning Platform", value: 625000, sector: "Creative Services", confidence: "high" },
    { name: "Enterprise Cybersecurity Assessment & Remediation Plan", value: 625000, sector: "Technology", confidence: "high" },
    { name: "Large-Scale Environmental Impact Statement (EIS)", value: 625000, sector: "Environmental", confidence: "high" },
    { name: "IT Systems Integration Blueprint (Enterprise)", value: 550000, sector: "Technology", confidence: "high" },
    { name: "Urban Master Plan (Major City)", value: 550000, sector: "Architecture", confidence: "high" }
  ]
};

// Save both files
const outputDir = path.join(__dirname, 'dashboard/data/extracted');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outputDir, 'claude_opus45_cli.json'),
  JSON.stringify(claudeOpusCLI, null, 2)
);

fs.writeFileSync(
  path.join(outputDir, 'you_ari.json'),
  JSON.stringify(youARI, null, 2)
);

console.log('✓ Extracted Claude Opus CLI data:', claudeOpusCLI.artifacts.length, 'artifacts');
console.log('✓ Extracted You-ARI data:', youARI.artifacts.length, 'artifacts');
console.log('\n✓ Data saved to dashboard/data/extracted/');
console.log('\nNext step: Run merge script for each model:');
console.log('  node merge-model-data.js claude_opus45_cli');
console.log('  node merge-model-data.js you_ari');
