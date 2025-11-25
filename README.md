# 2020 Human Artifact Index

An interactive dashboard comparing how 8 different AI models valued 227 professional artifacts (deliverables) from the pre-AI era of 2020, enriched with 2024 market research data.

## Live Dashboard

**[View the Dashboard](https://kevinselhi.github.io/artifact-index/dashboard/index.html)**

Or open locally: `dashboard/index.html`

## What is This?

This project captures a unique moment in history—the last full year before generative AI transformed professional services. It documents the most economically valuable professional artifacts created in 2020 and compares how different AI models approach valuation.

*All models had Deep Research or Extended Thinking enabled.*

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
  - **NEW**: Filter by market estimate confidence (High ≥80%, Medium 65-79%, Lower <65%)
  - View US Market Estimates (2024) with volume, TAM, and confidence scores
  - Clustered dropdown view showing artifacts grouped by confidence level

- **Variance Analysis**: Identify where models agree vs. disagree most

- **Model Comparison**: Side-by-side methodology and approach analysis

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
│   ├── index.html              # Main interactive dashboard
│   └── data/
│       ├── master_valuations.json
│       └── model_metadata.json
├── Research Documents/
│   ├── 2020_Human_Artifact_Index_Claude_Research.md
│   ├── GPT5_HumanArtifactsReport_v3.md
│   ├── o3pro_HumanArtivactsReport_v4.md
│   └── [Other model outputs...]
├── Analysis/
│   ├── Comparative_Analysis_Claude_vs_Gemini_2020_Artifact_Index.md
│   ├── Data_Visualizations_Report.md
│   └── PROJECT_SUMMARY.md
├── Data Files/
│   ├── artifact_data_export.csv
│   ├── master_artifact_valuations.csv
│   └── visualizations_data.json
├── LICENSE                       # MIT License
├── CLAUDE.md                     # Claude Code guidance
└── README.md
```

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

## Recent Updates

- **Confidence Filter**: Filter artifacts by market estimate confidence level
- **2024 Market Data**: All 211 artifacts now have research-backed market estimates
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
