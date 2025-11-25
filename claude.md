# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **ongoing multi-model AI evaluation project** analyzing professional artifact valuations. The project serves the same research prompt to multiple AI models and evaluates their outputs, methodologies, and interpretive approaches.

**Status:** 8-model comparison complete (November 2025) / Dashboard deployed

**Purpose:**
1. Document the most economically valuable professional artifacts (deliverables) created in 2020, before widespread AI disruption
2. Compare how different AI models interpret and respond to the same complex research prompt
3. Track AI disruption of professional services from 2020 baseline through 2024

## Repository Structure

### Model Outputs - 2020 Artifact Index

Each model was given the same research prompt (`TopArtifiact_System Prompt_v2.md`) to produce a ranked list of 100 professional artifacts:

| Model | File | Output Format | Key Characteristics |
|-------|------|---------------|---------------------|
| Claude Sonnet 4.5 | `2020_Human_Artifact_Index_Claude_Research.md` | Markdown | WebSearch methodology, market-rate billing focus |
| Gemini 2.5 Pro Deep Research | `## ⭐️ Gemini Deep Research Directive_ The 2020 Hu....txt` | Text | Deep synthesis, production-cost focus |
| GPT | `GPT5_HumanArtifactsReport_v3.md` | Markdown | — |
| o3pro | `o3pro_HumanArtivactsReport_v4.md` | Markdown | — |
| Claude Opus 4.5 | `artifact index 2020 claude opus 45.md` | Markdown | High confidence ratings, detailed source citations |
| Perplexity | `Perplexity_The 2020 Human Artifact Index – Scoping, Framework.md` | Markdown | 111-artifact taxonomy + 20 valued artifacts, 40 source citations, research-backed ranges |
| ChatGPT 5-1 Deep Research | `chatgpt 5-1 with deep research 2020 human artifact index.pdf` | PDF (32 pages) | Financial transactions focus, detailed profiles with real-world examples, 34-source bibliography |
| Gemini 3.0 Pro Deep Research | `Google Gemini 3.0 Pro with Thinking_2020 Human Artifact Index Research.pdf` | PDF (29 pages) | "Maximum Economic Value" methodology, 2020-specific artifacts (SPAC, EUA), 40 source citations, visible thinking process |

### Extended Research

- `artifact index 2018-2024 claude opus 45.md` - **Temporal analysis** comparing artifact production volumes pre-pandemic (2018-19) vs post-pandemic (2022-24). Covers regulatory filings, financial services, technology implementations, and more.

### Analysis Documents
- `7_model_comparison_analysis.md` - **Comprehensive 8-model comparison** with methodology matrix, top 10 rankings by model, variance analysis, and sector coverage
- `Comparative_Analysis_Claude_vs_Gemini_2020_Artifact_Index.md` - 13-section methodology comparison (original Claude vs Gemini)
- `Data_Visualizations_Report.md` - 15 ASCII visualizations comparing both approaches
- `PROJECT_SUMMARY.md` - Executive overview and key findings

### Framework & Templates
- `TopArtifiact_System Prompt_v2.md` - Original research prompt given to all AI models
- `4_field_profile_examples.md` - **Template** for detailed artifact profiles with 4 fields:
  - Description (deliverable components)
  - Producer Teams (2020 vs 2024 evolution)
  - Client Context (economic justification)
  - 2020→2024 Transformation (AI disruption metrics, value migration)

### Data Files
- `master_artifact_valuations.csv` - **Master dataset with all 8 models** (40+ artifacts with valuations, variance ratios)
- `artifact_id_mapping.json` - **Name normalization mapping** across all models (21 canonical artifacts with aliases)
- `artifact_data_export.csv` - Combined dataset (60+ entries with Claude/Gemini valuations)
- `visualizations_data.json` - Structured data for external visualization tools
- `baseline_data_enriched.csv` - Enriched baseline data

### Interactive Dashboard
- `dashboard/` - **Interactive HTML/JS visualization**
  - `dashboard/index.html` - Main dashboard with Chart.js visualizations (4 views: Overview, Comparison, Deep Dive, Variance) - **All 8 models including Gemini 3.0 Pro**
  - `dashboard/data/master_valuations.json` - JSON data for dashboard
  - `dashboard/data/model_metadata.json` - Model characteristics and comparison insights

### Reference Materials (PDFs)
- `AI Adoption by Elite Management Consulting Firms (2023–2025)_ A Comprehensive Analysis.pdf` - Industry research on consulting AI adoption
- `ari-jpmorgan-fraud-detection.pdf` - Case study reference

### Hackathon Materials (Historical)
- `HACKATHON_PROPOSAL.md`, `MERGED_TEAM_PROPOSAL.md`, `TECHNICAL_INTEGRATION_GUIDE.md`, etc. - Proposals from You.com Agentic Hackathon 2025 (concluded)

### Subdirectories
- `a2agents.com/` - Website/presentation directory (minimal content)

## Key Concepts

### The Core Insight
Different AI models produce **fundamentally different valuations** for the same artifacts because they interpret "value" differently:

- **Gemini 2.5:** Total production cost (all accumulated R&D, lifecycle costs)
- **Claude Sonnet 4.5:** Professional services billing fees (market rates for discrete engagements)
- **Claude Opus 4.5:** Hybrid approach with confidence ratings and detailed source citations
- **Perplexity:** Research-backed ranges with 40 source citations (highest 2020 specificity)
- **Gemini 3.0 Pro:** Maximum Economic Value (upper-bound premium firm billing)

**Example:** New Drug Application (NDA)
- Gemini: $100M-$500M (total cost to develop and file)
- Claude: $4M-$7M (consulting fee to prepare and submit)
- Claude Opus 4.5: $500K-$2M (preparation costs only, HIGH confidence)

All are correct - they answer different business questions.

### Methodological Differences by Model
| Model | Methodology | Transparency | Output Style |
|-------|-------------|--------------|--------------|
| Claude Sonnet 4.5 | WebSearch with documented queries | High | Narrative with citations |
| Gemini 2.5 Deep Research | Knowledge synthesis (black box) | Low | Comprehensive prose |
| Claude Opus 4.5 | Source hierarchy with confidence levels | High | Tabular + detailed profiles |
| Perplexity | 40-source citation research | High | Markdown with detailed profiles + taxonomy |
| ChatGPT 5-1 Deep Research | Industry reports + market data synthesis | High | PDF with numbered citations, sector analysis |
| Gemini 3.0 Pro Deep Research | Deep Research with visible thinking | High | PDF with "Est. Max" valuations, 40 citations |

### Multi-Model Evaluation Value
This project demonstrates that **AI model selection is not trivial**. Different models have:
- Different "research personalities" and interpretive frameworks
- Different strengths (Perplexity: citations & 2020 specificity; Gemini 2.5: depth; Claude Opus: rigor; Gemini 3.0: 2020-specific events)
- Different blind spots and biases

Using multiple models and comparing results produces more comprehensive insights than any single model alone.

## Working with This Repository

### This is NOT a Development Project
- There is **no code to build, test, or run**
- No package managers, dependencies, or build systems
- This is a **documentation and data repository only**

### Common Tasks

#### Analyzing the Data
To work with the structured data:
```bash
# View CSV in terminal
cat artifact_data_export.csv

# Parse JSON data
cat visualizations_data.json | python3 -m json.tool
```

#### Comparing Reports
Key files to compare for analysis:
1. Read Claude's top 10: `2020_Human_Artifact_Index_Claude_Research.md` (lines 1-500)
2. Read Gemini's top 10: `## ⭐️ Gemini Deep Research Directive_ The 2020 Hu....txt` (lines 1-400)
3. See comparison: `Comparative_Analysis_Claude_vs_Gemini_2020_Artifact_Index.md`

#### Understanding Methodology
- Start with: `PROJECT_SUMMARY.md` (10-minute overview)
- Deep dive: `Comparative_Analysis_Claude_vs_Gemini_2020_Artifact_Index.md` (30+ minutes)
- Original assignment: `TopArtifiact_System Prompt_v2.md`

### File Formats
- **Markdown (.md):** All primary documentation
- **JSON:** Structured data for programmatic access
- **CSV:** Spreadsheet-compatible export
- **TXT:** Plain text (Gemini's native output format)

## Key Findings Reference

### Value Concentration
- Top 10 artifacts = 68-82% of total value
- Bottom 50 artifacts = <3% of total value
- Medical/Pharma dominates (>50% of top 10)

### Top 5 by Model

**Gemini (Production Cost):**
1. New Drug Application - $100M-$500M+
2. Infrastructure Engineering Design - $50M-$150M+
3. Phase III Clinical Trial - $50M-$100M
4. Chapter 11 Restructuring - $20M-$75M
5. IPO S-1 Registration - $5M-$15M

**Claude Sonnet 4.5 (Service Billing):**
1. Phase 3 Clinical Trial - $15M-$30M
2. Phase 2 Clinical Trial - $8M-$15M
3. M&A Advisory Package - $4M-$8M
4. NDA/BLA Application - $4M-$7M
5. Fairness Opinion - $3M-$5M

**Claude Opus 4.5 (Hybrid w/ Confidence):**
1. Nuclear Power Plant Engineering Design - $300-500M (MEDIUM confidence)
2. Environmental Impact Statement (Federal EIS) - $1-2M typical, up to $85M (MEDIUM)
3. Phase III Pivotal Clinical Trial - $19-20M (HIGH confidence)
4. Combined Cycle Gas Turbine Plant Engineering - $20-50M (MEDIUM-HIGH)
5. Healthcare Facility Architectural Design - $3-10M (HIGH confidence)

**Perplexity (Research-Backed Ranges with 40 Citations):**
1. Phase III Clinical Trial - $20M-$100M+
2. Phase II Clinical Trial - $7M-$20M
3. Large-Cap M&A Advisory - $10M-$20M+
4. Infrastructure Engineering Design - $5M-$50M+
5. Digital Transformation Strategy - $2M-$10M

**ChatGPT 5-1 Deep Research (Financial Transactions Focus):**
1. IPO Prospectus & Offering Documents - $5M-$20M+
2. Enterprise ERP Implementation - $5M-$20M
3. Highway Infrastructure Design Package - $5M-$15M
4. Chapter 11 Reorganization Plan - $5M-$10M+
5. External Financial Audit Report (Annual) - $1M-$10M

**Gemini 3.0 Pro (Maximum Economic Value - Upper Bound Billing):**
1. SPAC Merger Proxy Statement - $2.5M+
2. Chapter 11 Plan of Reorganization - $2M+
3. M&A Fairness Opinion Report - $2M+
4. IPO Prospectus (Form S-1) - $1.5M+
5. Emergency Use Authorization Dossier - $1.2M+

### COVID-19 Impact (100% Model Consensus)
**Increased:** Clinical trials, bankruptcy restructuring, digital transformation, cybersecurity
**Decreased:** Commercial real estate, M&A (Q2 2020), trade shows, travel consulting

### 2018-2024 Temporal Analysis (Claude Opus 4.5)
Key findings from pandemic comparison:
- **SOC 2 audits:** +290% (20K → 78K/year)
- **Cloud migration projects:** +225% (20K → 65K/year)
- **De Novo device classifications:** +117% (18 → 39/year)
- **SPAC IPOs:** -95% from 2021 peak (613 → 31)
- **Chapter 7 bankruptcies:** -46% (493K → 266K/year)

## Current & Future Work

### Completed
- [x] **Multi-model comparison:** 8 models tested (Claude Sonnet 4.5, Gemini 2.5, GPT, o3pro, Claude Opus 4.5, Perplexity, ChatGPT 5-1, Gemini 3.0 Pro)
- [x] **Temporal analysis:** 2018-2024 pandemic comparison completed
- [x] **Structured taxonomy:** 111-artifact CSV with sector/subsector classification
- [x] **Interactive dashboard:** 8-model comparison dashboard with Chart.js visualizations

### In Progress
- [ ] **4-Field Artifact Profiles:** Detailed transformation analysis using template in `4_field_profile_examples.md`
- [ ] **AI Disruption Metrics:** Quantifying value migration from professional services to AI tools

### Future Opportunities
1. **Additional Models:** Test emerging models (GPT-5, Claude 4, Gemini 2.0, etc.)
2. **Human Validation:** Interview professionals to verify valuations
3. **Interactive Dashboard:** Build web visualization using `visualizations_data.json`
4. **Vertical Deep Dives:** Detailed analysis for specific sectors (Legal, Pharma, Consulting)

### How to Add New Model Comparisons

**Naming convention:** `artifact index [year] [model name].md` or `[ModelName]_HumanArtifactsReport_v[N].md`

Steps:
1. Use prompt from `TopArtifiact_System Prompt_v2.md`
2. Save output in repository root
3. Add row to Model Outputs table in this CLAUDE.md
4. Note key methodological characteristics
5. Update Key Findings with model's top 5

### The 4-Field Profile Framework

For detailed artifact analysis, use the template in `4_field_profile_examples.md`:

```
**DESCRIPTION:** What the deliverable contains (75-150 words)

**PRODUCER TEAMS:** Who creates it - 2020 vs 2024 team composition,
timeline, AI tools adopted (100-175 words)

**CLIENT CONTEXT:** Why clients pay - economic justification,
decision triggers (100-150 words)

**2020→2024 TRANSFORMATION:** AI disruption metrics, cost/time
reduction percentages, value migration to AI platforms, named
tools (Harvey AI, Luminance, etc.) (200-350 words)
```

This framework enables systematic comparison of how AI has disrupted each artifact type.

## Data Quality Notes

### 2020 Specificity Limitations
- Professional services pricing rarely published by year
- Proxy data from 2019-2021 used where 2020 unavailable
- Best 2020 data: Public filings (SEC, court records)
- Weakest 2020 data: Private consulting, creative services

### Geographic Bias
- Primarily US-centric data
- Global markets underrepresented
- Valuations reflect US professional services market rates

## Use Cases

### When to Use Gemini's Values
- Budgeting R&D or infrastructure projects
- Economic policy analysis
- Understanding total project costs
- Investment analysis

### When to Use Claude's Values
- Negotiating with consultants/service providers
- Fee benchmarking for procurement
- Vendor selection and RFP pricing
- Hiring outside firms

### When to Use Both
- Comprehensive market analysis
- Cross-validation of assumptions
- Understanding full value chain
- Strategic vs. tactical planning

## Important Context

### Why This Project Matters
This research captured a **unique moment in history** - the last full year before generative AI (ChatGPT, Claude, etc.) transformed professional services. It serves as a baseline for measuring AI's economic impact on knowledge work.

### The Meta-Lesson
This project demonstrates that **AI model selection is not trivial**. Different models have different "research personalities," strengths, and blind spots. Using multiple models and comparing results produces more comprehensive insights than any single model alone.

## You.com Agentic Hackathon 2025 Context (Historical)

> **Note:** The hackathon concluded October 30, 2025. $60 in You.com API credits remain available but ARI model access has ended.

### Hackathon Proposals (Archived)
Proposals were developed but not submitted as working demos:

**Hackathon Files:**
- `HACKATHON_PROPOSAL.md` - MultiMind Research Validator concept (multi-model orchestration)
- `MERGED_TEAM_PROPOSAL.md` - AI Disruption Impact Index 2024 (2020→2024 temporal analysis)
- `TECHNICAL_INTEGRATION_GUIDE.md` - Implementation details
- `TEAM_KICKOFF_MESSAGE.md` - Team coordination materials
- `QUICK_START_GUIDE.md` - Setup instructions

**Proposed Concepts:**
1. **MultiMind Research Validator:** Automate the manual multi-model comparison process that created this project
2. **AI Disruption Impact Index 2024:** Use 2020 baseline to measure real-time AI disruption through 2024

### Remaining Resources
- **$60 You.com API credits** available for web search, RAG, and chat APIs
- ARI (Advanced Research Intelligence) model access ended with hackathon

### You.com Agentic Hackathon 2025 - Winners & Learnings

**Event Details:**
- **Dates:** October 27-30, 2025 (4-day hackathon)
- **Participants:** 300+ developers
- **Focus:** AI-powered tools using You.com's APIs
- **Prize Pool:** $5,000 + API credits for winners

**Grand Prize Winners:**

🥇 **First Place: MINA** (Summer Chang)
- Startup research assistant with three modes: Trend Research, Startup Radar, and Funding Research
- Transforms web data into structured insights with verified sources
- Built with React, V0, and You.com's Web Search API

🥈 **Second Place: DeepRadar** (Noemi Titarenco)
- Industry monitoring system that autonomously scans news and press releases
- Filters noise, identifies duplicates, delivers daily shareable reports
- Solves organizational awareness of relevant developments

🥉 **Third Place: Hacksmith** (Saif Ali Shaik)
- CLI tool helping users avoid excessive browsing
- Leverages You.com's content and search APIs for AI agent instructions

**Track Winner - Best Use of You.com API: RAG Pipeline V2** (Anubhav Sharma)
- Automates multi-format document parsing and retrieval
- Targets accounting, legal, and financial teams
- Reduces hallucinations, improves numerical accuracy

**Honorable Mention: YouCredit** (Rishyanth Reddy)
- Streamlines R&D tax credit claims through HR platform integration
- You.com API-powered automation
- ~85% accuracy in initial testing

### Judging Criteria (What Actually Won)

| Criterion | Weight | What Winners Did Well |
|-----------|--------|----------------------|
| **Innovation & Originality** | 25% | Novel API applications, creative agentic approaches |
| **Technical Implementation** | 25% | Integration quality, scalability, clean code |
| **Impact & Relevance** | 20% | Enterprise problem-solving, scalability potential |
| **User Experience** | 15% | Interface intuitiveness, demo quality |
| **Presentation & Documentation** | 15% | Clarity of video/repository materials |

**Key Success Patterns:**
- ✅ Clear, specific use cases (startup research, industry monitoring, tax credits)
- ✅ Professional user targets (enterprises, legal teams, financial services)
- ✅ Demonstrated working systems (not just concepts)
- ✅ Clean demos and documentation
- ✅ Multiple You.com API integrations (Search, RAG, Chat)

**What Resonated with Judges:**
1. **Practical applications** over theoretical frameworks
2. **Vertical-specific solutions** (legal, finance, accounting) over general tools
3. **Automation of existing workflows** rather than creating new ones
4. **Clean, focused demos** that showed immediate value
5. **Real accuracy metrics** (~85% for YouCredit, numerical precision for RAG Pipeline)

### Lessons for Future Extensions

**If Building on This Project:**

1. **Vertical Focus:** Instead of "all professional artifacts," target specific industries
   - Example: "Legal Services AI Disruption Tracker" (just law firm artifacts)
   - Example: "Pharma Deliverables Value Monitor" (just medical/clinical artifacts)

2. **Working Demos > Concepts:** Hackathon winners had functional systems, not proposals
   - Build minimum viable demo first
   - Show real output with real data
   - Live demos beat slide decks

3. **Enterprise Pain Points:** Winners solved specific organizational problems
   - MINA: Startup research workflow
   - DeepRadar: Industry news monitoring
   - YouCredit: Tax credit complexity
   - RAG Pipeline: Document accuracy for professionals

4. **API Integration Depth:** Best Use winner showcased advanced API orchestration
   - Multi-format parsing (RAG strength)
   - Numerical accuracy focus (domain-specific quality)
   - Professional team targeting (clear customer)

5. **Real Metrics Matter:** Quantified improvements (85% accuracy, reduced hallucinations)
   - This project has strong baseline comparisons (5-55x valuation differences)
   - Could demonstrate: "Multi-model validation caught X% more insights"

### Potential Future Hackathon Entry

**Strong Concept from This Baseline:**

**"Professional Services Pricing Intelligence Platform"**
- Input: Service type (e.g., "M&A due diligence")
- Output:
  - 2020 baseline pricing (from this dataset)
  - 2024 current market rates (You.com Search)
  - AI disruption analysis (which tools replaced what)
  - Pricing negotiation guidance (what to pay now vs. 2020)
- Target: Procurement teams, CFOs, consultants
- Value: Answers "what should this cost in 2024?" with AI disruption context

**Why This Would Score Well:**
- ✅ Innovation: Temporal pricing analysis with AI disruption layer
- ✅ Technical: You.com Search (current data) + RAG (baseline retrieval) + Chat (analysis)
- ✅ Impact: Every business negotiates professional services fees
- ✅ UX: Simple input → comprehensive pricing intelligence
- ✅ Presentation: Clear before/after story, real data, quantified savings

## Quick Reference

### For Quick Understanding (15 minutes)
1. Read `PROJECT_SUMMARY.md`
2. Skim `Data_Visualizations_Report.md`
3. Check top 10 lists above

### For Deep Analysis (2+ hours)
1. Read full Claude report (45 min)
2. Read full Gemini report (45 min)
3. Study `Comparative_Analysis_Claude_vs_Gemini_2020_Artifact_Index.md` (30 min)
4. Analyze CSV/JSON data

### For Specific Queries
- **AI methodology research:** Start with Comparative Analysis
- **Professional services pricing:** Claude report primary
- **Project cost estimation:** Gemini report primary
- **COVID-19 impacts:** Section 9 in both reports + visualizations
- **2020 baseline data:** Combined dataset (CSV)

---

**Last Updated:** November 25, 2025
**Project Directory:** `/Users/kevinselhi/artifact-index/`
**Project Status:** Active multi-model evaluation / 7 models tested
**Models Evaluated:** Claude Sonnet 4.5, Gemini 2.5 Pro Deep Research, GPT, o3pro, Claude Opus 4.5, Perplexity, ChatGPT 5-1 Deep Research
**Hackathon Context:** You.com Agentic Hackathon 2025 concluded (Oct 27-30) - $60 API credits remaining
