# AI Opportunity Index

An interactive dashboard comparing how 8 different AI models valued 227 professional artifacts (deliverables) from the pre-AI era of 2020, enriched with 2024 market research data and real-time industry intelligence powered by You.com Search API.

## Live Dashboard

**[View the Dashboard](https://kevinselhi.github.io/artifact-index/dashboard/index.html)**

Or open locally: `dashboard/index.html`

## What is This?

This project captures a unique moment in history—the last full year before generative AI transformed professional services. It documents the most economically valuable professional artifacts created in 2020 and compares how different AI models approach valuation.

### The Core Insight

Different AI models can produce **fundamentally different valuations** for the same artifacts because they often measure different things. For example:

| Model | Approach | Example: NDA Filing |
|-------|----------|---------------------|
| **Gemini 2.5 Pro** | Total production cost | $100M-$500M |
| **Claude Sonnet 4.5** | Professional services billing | $4M-$7M |
| **ChatGPT 5** | Median market fees | $900K |

Using multiple methods and models can be valuable because they ask different business questions, which help users to understand a larger surface area of the problem.

## Features

### Interactive Dashboard

- **Overview Tab**:
  - Automation Opportunity Matrix (bubble chart by industry)
  - AI Disruption Readiness cards with 2024 market sizes
  - Filter industries by readiness level (High/Medium/Low)
  - Top artifact values and methodology comparison across all 8 models

- **Artifact Deep Dive**:
  - Analyze any of 227 artifacts with detailed breakdowns
  - Sort by: A-Z, Value, Market Size, or Model Consensus
  - Filter by industry sector
  - Filter by market estimate confidence (High ≥80%, Medium 65-79%, Lower <65%)
  - View US Market Estimates (2024) with volume, TAM, and confidence scores
  - Clustered dropdown view showing artifacts grouped by confidence level
  - **Industry Intelligence Reports**: Real-time industry insights powered by You.com Search API
    - AI Impact & Automation Trends
    - Industry Trends & Innovation
    - Market Analysis & Insights
    - Available for all 28 sectors with comprehensive coverage

- **Variance Analysis**:
  - Identify where models agree vs. disagree most
  - Enhanced notes showing consensus strength and distribution analysis
  - Low variance: Model count and consensus cluster metrics
  - Mid-range variance: Model coverage and mean/median gap analysis

- **Model Comparison**:
  - Side-by-side methodology and approach analysis
  - **Model Characteristics & Behavioral Analysis** panel:
    - Coverage Score: % of high-confidence artifacts included
    - Uniqueness Score: % of artifacts with distinctive perspective
    - Valuation Deviation: Alignment with ensemble consensus
    - Interpretive labels showing each model's behavioral pattern

### Data Included

- **227 professional artifacts** across 28 industry sectors
- **8 AI model valuations** per artifact (where available)
- **2024 Market estimates** for each artifact type:
  - Annual volume (e.g., "150-250 Phase III trials/year")
  - Total addressable market (e.g., "$3B-$6B")
  - Confidence scores (55-95%)
  - Source citations (FDA, SEC, USPTO, industry research)

## Quick Start

### Option 1: View Live
Visit: **https://kevinselhi.github.io/artifact-index/dashboard/index.html**

### Option 2: View Locally
```bash
git clone https://github.com/kevinselhi/artifact-index.git
cd artifact-index
open dashboard/index.html
```

## Repository Structure

```
artifact-index/
├── dashboard/
│   ├── index.html                    # Main interactive dashboard (static HTML/JS)
│   └── data/
│       ├── master_valuations.json    # 227 artifacts with valuations
│       ├── model_metadata.json       # Model characteristics and insights
│       ├── industry-reports.json     # You.com API industry intelligence (28 sectors)
│       └── you-search-results.json   # Artifact-specific search results
├── src/
│   └── mcp-server.ts                 # MCP server (experimental)
├── dist/
│   └── mcp-server.js                 # Compiled MCP server
├── fetch-you-results.js              # Batch fetch artifact search results
├── generate-industry-reports.js      # Generate industry intelligence reports
├── 2020_Human_Artifact_Index_Claude_Research.md
├── GPT5_HumanArtifactsReport_v3.md
├── o3pro_HumanArtivactsReport_v4.md
├── Comparative_Analysis_Claude_vs_Gemini_2020_Artifact_Index.md
├── Data_Visualizations_Report.md
├── PROJECT_SUMMARY.md
├── artifact_data_export.csv
├── master_artifact_valuations.csv
├── visualizations_data.json
├── package.json
├── LICENSE                           # MIT License
├── CLAUDE.md                         # Claude Code guidance
└── README.md
```

Note: Research documents and analysis files live at the repository root, not in subdirectories.

## AI Models Compared

| Model | Color | Methodology | Top Artifact | Top Value |
|-------|-------|-------------|--------------|-----------|
| Claude Opus 4.5 | Green | WebSearch + Confidence | Nuclear Plant Engineering | $400M |
| Gemini 2.5 Pro | Blue | Deep Research Synthesis | New Drug Application | $300M |
| Perplexity | Orange | Taxonomy + 40 Citations | Phase III Clinical Trial | $60M |
| Claude Sonnet 4.5 | Coral | WebSearch Investigation | Phase III Clinical Trial | $22.5M |
| ChatGPT 5-1 | Teal | Deep Research | IPO Prospectus | $12.5M |
| Gemini 3.0 Pro | Cyan | Deep Research + Thinking | SPAC Merger Proxy | $2.5M |
| o3pro | Purple | Market Analysis + Automation | M&A Advisory | $2.2M |
| ChatGPT 5 | Red | Median Market Analysis | ERP Implementation | $900K |

## Key Findings

### Value Concentration
- Top 10 artifacts = 68-82% of total value
- Bottom 50 artifacts = <3% of total value
- Medical/Pharma dominates (>50% of top 10)

### Highest Model Variance
- **Infrastructure Engineering**: 533x variance ($750K to $400M)
- **NDA Filing**: 55x variance ($5.5M to $300M)

### Strongest Model Consensus
- **Tax Opinion**: 1.75x variance (all models within $200K-$350K)
- **M&A Advisory**: 1.4x variance (5 models agree closely)

## Use Cases

### For Startup Founders
- Identify large market opportunities for AI automation
- Sort artifacts by "Market" to find biggest TAM
- Filter by "High Confidence" to focus on well-researched markets
- Use industry filtering to focus on your vertical

### For Consultants
- Benchmark professional service fees
- Compare your pricing to market ranges
- Understand value perception across methodologies

### For Researchers
- Study AI model methodology differences
- Analyze valuation variance patterns
- Use as baseline for measuring AI disruption impact

## Data Sources

### Model Valuations
- Claude Sonnet 4.5 & Opus 4.5 (Anthropic)
- Gemini 2.5 Pro & 3.0 Pro (Google)
- ChatGPT 5 & 5-1 (OpenAI)
- o3pro (OpenAI)
- Perplexity

### 2024 Market Research
- **FDA**: Clinical trials (ClinicalTrials.gov), drug approvals (CDER), device submissions (CDRH)
- **SEC**: IPO filings, M&A activity, public company audits
- **USPTO**: Patent litigation statistics
- **Industry Research**: Statista, IBISWorld, Grand View Research, MarketsandMarkets, Mordor Intelligence, Precedence Research (2023-2024 reports)

### Real-Time Industry Intelligence (You.com Search API)
- **28 Industry Sectors** covered with comprehensive reports
- **3 Query Categories** per sector:
  - AI Impact & Automation Trends
  - Industry Trends & Innovation
  - Market Analysis & Insights
- **Static pre-fetched data** for GitHub Pages deployment (no API calls from browser)
- Generated via `generate-industry-reports.js` script
- Stored in `dashboard/data/industry-reports.json` (191KB)

## MCP Server (Experimental)

An experimental Model Context Protocol (MCP) server is included for programmatic access (and powering the dashboard chat).

### Setup
```bash
npm install
npm run build
```

### Run
```bash
npm run dev:stdio    # Local stdio (Claude Code, VS Code, Cursor)
npm run dev:http     # HTTP (defaults to http://localhost:3000/mcp)
npm start            # Production HTTP (after build)
```

### Resources & Tools
- Resources: `resource://artifact-index/comparison`, `resource://artifact-index/valuations`, `resource://artifact-index/models`, `resource://artifact-index/artifacts/{id}`
- Tools: `query-artifacts`, `top-variance`, `consensus`, `list-models`, `industry-news`
- Live search (You.com, requires `YOU_API_KEY`): `you-news-search`, `you-web-search`
- Prompts: `orchestrator` plus sector subprompts (e.g., medical-pharma, technology, engineering)
- News: `industry-news` tool (returns AI deployment news for the last six months of 2025; requires `NEWS_FEED_PATH` JSON feed)

### Dashboard Chat (beta)
- The Artifact Deep Dive view includes an MCP Agent panel. Set the MCP endpoint (default `http://localhost:3000/mcp`) and click Test. If running via HTTP with CORS allowing `kevinselhi.github.io`, the dashboard can reach the MCP server.

### Env Vars
- `MODEL_COMPARISON_PATH` (default: `7_model_comparison_analysis.md`)
- `VALUATIONS_PATH` (default: `dashboard/data/master_valuations.json`)
- `MODEL_METADATA_PATH` (default: `dashboard/data/model_metadata.json`)
- `NEWS_FEED_PATH` (optional: `dashboard/data/industry-news.json`)
- `YOU_API_KEY` (required for live You.com search tools)
- `YOU_BASE_URL` (optional, defaults to `https://api.ydc-index.io`)
- `PORT`, `HTTP_ORIGINS`, `HTTP_HOSTS` for HTTP transport

## Recent Updates (November 2025)

### Dashboard Enhancements
- **Renamed to "AI Opportunity Index"**: Better reflects the dashboard's focus on AI automation opportunities
- **Model Characteristics Panel**: Quantitative behavioral analysis of each AI model
  - Coverage Score: Comprehensiveness vs. high-confidence artifacts
  - Uniqueness Score: Distinctive perspective measurement
  - Valuation Deviation: Alignment with ensemble consensus
  - Interpretive labels for each model's approach
- **Enhanced Variance Analysis**: Meaningful notes instead of redundant explanations
  - Low variance shows consensus strength metrics
  - Mid-range variance shows model coverage and distribution analysis

### Industry Intelligence Integration (You.com Search API)
- **28 Industry Reports** with real-time market insights
- **3 Query Categories**: AI Impact, Industry Trends, Market Analysis
- **Static JSON deployment** for GitHub Pages compatibility
- **191KB industry-reports.json** with comprehensive sector coverage
- **Batch generation scripts**: `generate-industry-reports.js` and `fetch-you-results.js`

### Previous Updates
- **Confidence Filter**: Filter artifacts by market estimate confidence level
- **2024 Market Data**: All 227 artifacts now have research-backed market estimates
- **Mobile Optimization**: Improved bubble chart rendering on mobile devices
- **Industry Market Sizes**: Updated with 2024 research data from industry reports

## Contributing

This is primarily a research archive, but contributions are welcome:
- Additional AI model valuations
- Updated market data
- Bug fixes to the dashboard

## License

MIT License - See LICENSE file for details.

---

**Project Status**: Research complete / Dashboard active

**Last Updated**: November 2025
