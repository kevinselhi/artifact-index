# 8-Model Comparison Analysis: The 2020 Human Artifact Index

**Analysis Date:** November 25, 2025
**Models Evaluated:** Claude Sonnet 4.5, Gemini 2.5 Pro, Claude Opus 4.5, ChatGPT 5-1, ChatGPT 5, o3pro, Perplexity, Gemini 3.0 Pro

---

## Executive Summary

This analysis compares how eight different AI models interpreted and valued the same research prompt: identify the 100 most valuable professional artifacts produced in 2020. The models produced **dramatically different valuations** for identical artifacts, with variance ratios ranging from 1.0x (perfect agreement) to 533x (fundamental disagreement).

### Key Findings

1. **Valuation Philosophy Divergence**: Models split into three camps:
   - **Production Cost Models** (Gemini 2.5, ChatGPT 5-1): Value total cost to produce artifact
   - **Service Fee Models** (Claude variants, ChatGPT 5, o3pro): Value professional billing rates
   - **Maximum Economic Value Models** (Gemini 3.0 Pro): Value upper-bound premium firm billing

2. **Sector Prioritization**: Each model showed distinct sector biases:
   - Gemini 2.5: Medical/Pharma dominance (top 3 artifacts)
   - o3pro: Management Consulting dominance (top 8 artifacts)
   - ChatGPT 5: Technology Services dominance (top 7 artifacts)
   - Gemini 3.0: Financial Services dominance (SPAC/M&A focus)

3. **Agreement Zones**: Models converged on:
   - Medical Device 510(k) submissions (~$300K across all models)
   - M&A Advisory services ($2.2M-$7M range)
   - Financial Due Diligence ($800K-$1.25M range)

4. **Controversy Zones**: Models diverged dramatically on:
   - NDA Submissions: $5.5M (Claude) vs $300M (Gemini) = **55x variance**
   - Infrastructure Engineering: $10M (ChatGPT) vs $400M (Opus 4.5) = **40x variance**
   - EIS: $1.35M (Claude) vs $43M (Opus 4.5) = **32x variance**

---

## Model Profiles

### 1. Claude Sonnet 4.5
- **Source File:** `2020_Human_Artifact_Index_Claude_Research.md`
- **Methodology:** WebSearch-based investigation
- **Valuation Approach:** Professional services billing (market rates)
- **Artifacts Produced:** 100
- **Top Artifact:** Phase 3 Clinical Trial ($15M-$30M)
- **Sector Bias:** Balanced across Medical, Financial, Legal
- **Unique Strength:** Transparent methodology, documented searches
- **Limitation:** May undervalue complex internal R&D artifacts

### 2. Gemini 2.5 Pro Deep Research
- **Source File:** `## ⭐️ Gemini Deep Research Directive_ The 2020 Hu....txt`
- **Methodology:** Deep synthesis from knowledge base
- **Valuation Approach:** Total production cost (lifecycle)
- **Artifacts Produced:** 100
- **Top Artifact:** NDA Submission ($100M-$500M)
- **Sector Bias:** Heavy Medical/Pharma, Engineering
- **Unique Strength:** Captures full economic value of complex artifacts
- **Limitation:** Black-box methodology, values may include sunk costs

### 3. Claude Opus 4.5
- **Source File:** `artifact index 2020 claude opus 45.md`
- **Methodology:** WebSearch with confidence ratings
- **Valuation Approach:** Professional services billing with ranges
- **Artifacts Produced:** 100
- **Top Artifact:** Nuclear Plant Engineering ($300M-$500M)
- **Sector Bias:** Engineering, Medical/Pharma
- **Unique Strength:** Confidence ratings (HIGH/MEDIUM/LOW)
- **Limitation:** Some extreme outliers (EIS at $85M high end)

### 4. ChatGPT 5-1 with Deep Research
- **Source File:** `chatgpt 5-1 with deep research 2020 human artifact index.pdf`
- **Methodology:** Deep research synthesis
- **Valuation Approach:** Market rates with implementation scope
- **Artifacts Produced:** 100
- **Top Artifact:** IPO Prospectus ($5M-$20M)
- **Sector Bias:** Financial transactions, Technology
- **Unique Strength:** 34-source bibliography, academic rigor
- **Limitation:** Financial services focus may underweight other sectors

### 5. ChatGPT 5
- **Source File:** `GPT5_HumanArtifactsReport_v3.md`
- **Methodology:** Market analysis with category anchors
- **Valuation Approach:** Median project values (service fees)
- **Artifacts Produced:** 100
- **Top Artifact:** ERP System Integration ($900K)
- **Sector Bias:** IT & Digital Services dominance
- **Unique Strength:** Detailed category economics, PowerPoint-ready
- **Limitation:** Significantly lower valuations than other models

### 6. o3pro
- **Source File:** `o3pro_HumanArtivactsReport_v4.md`
- **Methodology:** Market analysis with automation scoring
- **Valuation Approach:** Typical project fees (service billing)
- **Artifacts Produced:** 100
- **Top Artifact:** M&A Advisory Services ($2.2M)
- **Sector Bias:** Management Consulting dominance
- **Unique Strength:** 2025 automation suitability scores (1-5)
- **Limitation:** Consulting-centric view may undervalue technical artifacts

### 7. Perplexity
- **Source File:** `Perplexity_The 2020 Human Artifact Index – Scoping, Framework.md`
- **Methodology:** Structured taxonomy with cited valuations
- **Valuation Approach:** Research-backed ranges with 40 citations
- **Artifacts Produced:** 111 (taxonomy) + 20 with valuations
- **Top Artifact:** Phase III Clinical Trial ($20M-$100M+)
- **Sector Bias:** Balanced across sectors with explicit ranking
- **Unique Strength:** Extensive source citations (40+ footnotes), explicit methodology
- **Limitation:** Fewer artifacts with valuations than other models

### 8. Gemini 3.0 Pro with Deep Research
- **Source File:** `Google Gemini 3.0 Pro with Thinking_2020 Human Artifact Index Research.pdf`
- **Methodology:** Deep Research with Thinking (visible reasoning process)
- **Valuation Approach:** Maximum Economic Value (upper-bound premium firm billing)
- **Artifacts Produced:** 100
- **Top Artifact:** SPAC Merger Proxy Statement ($2.5M+)
- **Sector Bias:** Financial Services dominance, 2020-specific events (SPAC boom, COVID)
- **Unique Strength:** 40 source citations, strong 2020 temporal specificity, visible thinking process
- **Limitation:** Values only "Est. Max" (upper bound) without range minimums

---

## Methodology Comparison Matrix

| Dimension | Claude Sonnet | Gemini 2.5 | Opus 4.5 | ChatGPT 5-1 | ChatGPT 5 | o3pro | Perplexity | Gemini 3.0 |
|-----------|-------------|------------|----------|-------------|--------|-------|------------|------------|
| **Valuation Philosophy** | Service fees | Production cost | Service fees | Market rates | Median fees | Project fees | Research-backed | Max Economic |
| **Artifact Count** | 100 | 100 | 100 | 100 | 100 | 100 | 111 (20 valued) | 100 |
| **Confidence Ratings** | No | No | Yes | No | No | No | No | No |
| **Automation Scores** | No | No | No | No | No | Yes | No | No |
| **Source Citations** | Embedded | 16-source | Embedded | 34-source | Embedded | Embedded | 40-source | 40-source |
| **Research Transparency** | High | Medium | High | High | Medium | Medium | High | High |
| **2020 Data Specificity** | Mixed | Mixed | Mixed | Mixed | Mixed | Mixed | High | High |
| **COVID-19 Analysis** | Yes | Yes | Yes | Yes | Yes | Yes | Limited | Yes (SPAC/EUA) |

---

## Top 10 Rankings by Model

### Claude Sonnet 4.5
| Rank | Artifact | Value |
|------|----------|-------|
| 1 | Phase 3 Clinical Trial | $15M-$30M |
| 2 | NDA/BLA Application | $3M-$8M |
| 3 | Large-Cap M&A Advisory | $2M-$10M |
| 4 | Corporate Due Diligence | $500K-$1.5M |
| 5 | IPO Legal Services | $700K-$2M |
| 6 | Fairness Opinion | $500K-$7.5M |
| 7 | Phase 2 Clinical Trial | $8M-$15M |
| 8 | Environmental Impact Statement | $700K-$2M |
| 9 | Bankruptcy Restructuring | $1M-$5M |
| 10 | Digital Transformation | $1M-$3M |

### Gemini 2.5 Pro
| Rank | Artifact | Value |
|------|----------|-------|
| 1 | New Drug Application | $100M-$500M |
| 2 | Infrastructure Engineering Design | $50M-$150M |
| 3 | Phase III Clinical Trial | $50M-$100M |
| 4 | Chapter 11 Restructuring | $20M-$75M |
| 5 | IPO S-1 Registration | $5M-$15M |
| 6 | Urban Master Plan | $5M-$10M |
| 7 | M&A Definitive Agreement | $4M-$10M |
| 8 | Enterprise Software Architecture | $3M-$10M |
| 9 | Digital Transformation Roadmap | $2.5M-$7.5M |
| 10 | Super Bowl Commercial | $2M-$7M |

### Claude Opus 4.5
| Rank | Artifact | Value |
|------|----------|-------|
| 1 | Nuclear Plant Engineering | $300M-$500M |
| 2 | Environmental Impact Statement | $1M-$85M |
| 3 | Phase III Clinical Trial | $19M-$20M |
| 4 | Chapter 11 Restructuring | $5M-$20M |
| 5 | IPO Registration | $2M-$8M |
| 6 | M&A Advisory Mandate | $2.5M-$7.5M |
| 7 | Phase II Clinical Trial | $8M-$12M |
| 8 | Digital Transformation | $1.5M-$5M |
| 9 | ERP Implementation | $1M-$5M |
| 10 | Cloud Migration | $500K-$2M |

### ChatGPT 5-1 Deep Research
| Rank | Artifact | Value |
|------|----------|-------|
| 1 | IPO Prospectus & S-1 | $5M-$20M+ |
| 2 | Enterprise ERP Implementation | $5M-$20M |
| 3 | Highway/Bridge Design Package | $5M-$15M |
| 4 | Chapter 11 Plan & Disclosure | $5M-$10M+ |
| 5 | Annual Audit Report | $1M-$10M |
| 6 | M&A Due Diligence Package | $1M-$5M |
| 7 | Phase III Clinical Trial | $2M-$8M |
| 8 | Environmental Assessment | $500K-$3M |
| 9 | Cybersecurity Framework | $500K-$2M |
| 10 | Digital Transformation | $500K-$2M |

### ChatGPT 5
| Rank | Artifact | Value |
|------|----------|-------|
| 1 | ERP System Integration | $900K |
| 2 | Enterprise Software Implementation | $800K |
| 3 | IT Infrastructure Modernization | $750K |
| 4 | Data Analytics Platform | $700K |
| 5 | Cloud Migration Project | $600K |
| 6 | Business Intelligence Solution | $550K |
| 7 | Custom Software Development | $500K |
| 8 | M&A Advisory | $500K |
| 9 | Digital Transformation Strategy | $450K |
| 10 | Cybersecurity Assessment | $400K |

### o3pro
| Rank | Artifact | Value |
|------|----------|-------|
| 1 | M&A Advisory Services | $2.2M |
| 2 | Strategic Transformation Consulting | $1.8M |
| 3 | Corporate Strategy Development | $1.7M |
| 4 | Digital Transformation Strategy | $1.65M |
| 5 | Business Process Re-engineering | $1.6M |
| 6 | Performance Improvement Consulting | $1.5M |
| 7 | Organizational Restructuring | $1.4M |
| 8 | Market-Entry Strategy | $1.3M |
| 9 | Blockchain Implementation Roadmap | $1.3M |
| 10 | ERP System Implementation Plan | $1.2M |

### Perplexity
| Rank | Artifact | Value |
|------|----------|-------|
| 1 | Phase III Clinical Trial | $20M-$100M+ |
| 2 | Phase II Clinical Trial | $7M-$20M |
| 3 | Large-Cap M&A Advisory | $10M-$20M+ |
| 4 | Upper Mid-Market M&A Advisory | $2M-$5M |
| 5 | Infrastructure Engineering | $5M-$50M+ |
| 6 | Hospital Architecture | $1M-$15M |
| 7 | Digital Transformation Strategy | $2M-$10M |
| 8 | ERP System Implementation | $500K-$5M |
| 9 | Brand Repositioning & Campaign | $1M-$10M |
| 10 | Chapter 11 Restructuring | $1M-$10M |

### Gemini 3.0 Pro
| Rank | Artifact | Value (Est. Max) |
|------|----------|------------------|
| 1 | SPAC Merger Proxy Statement | $2,500,000+ |
| 2 | Chapter 11 Plan of Reorganization | $2,000,000+ |
| 3 | M&A Fairness Opinion Report | $2,000,000+ |
| 4 | IPO Prospectus (Form S-1) | $1,500,000+ |
| 5 | Emergency Use Authorization Dossier | $1,200,000+ |
| 6 | New Drug Application (NDA) | $1,000,000+ |
| 7 | Biologics License Application (BLA) | $1,000,000+ |
| 8 | Expert Witness Report (Complex Lit.) | $500,000+ |
| 9 | ERP Implementation Strategy | $450,000+ |
| 10 | Phase III Clinical Study Report | $250,000+ |

---

## Variance Analysis

### Highest Agreement Artifacts (Variance Ratio < 2x)

| Artifact | Models | Variance Ratio | Value Range |
|----------|--------|----------------|-------------|
| Medical Device 510(k) | 3 | 1.00x | $300K (all) |
| M&A Advisory | 5 | 1.40x | $2.2M-$7M |
| Tax Opinion | 4 | 1.75x | $200K-$350K |
| Financial Due Diligence | 5 | 1.56x | $800K-$1.25M |
| Patent Litigation | 2 | 1.57x | $350K-$550K |

**Insight:** Agreement clusters around well-defined professional services with established fee structures.

### Highest Controversy Artifacts (Variance Ratio > 10x)

| Artifact | Models | Variance Ratio | Low Value | High Value | Explanation |
|----------|--------|----------------|-----------|------------|-------------|
| Infrastructure Engineering | 4 | 533x | $750K (GPT) | $400M (Opus) | GPT = IT; Opus = nuclear plants |
| NDA Submission | 2 | 55x | $5.5M (Claude) | $300M (Gemini) | Consulting fee vs total R&D cost |
| EIS | 3 | 32x | $1.35M (Claude) | $43M (Opus) | Standard vs nuclear/major project |
| ERP Implementation | 6 | 22x | $900K (GPT) | $20M (ChatGPT) | Scope variance (mid vs enterprise) |
| Chapter 11 Restructuring | 4 | 16x | $3M (Claude) | $47.5M (Gemini) | Advisory fees vs total process cost |

**Insight:** Variance increases when:
1. Artifact scope is ambiguous (ERP can mean $500K or $20M project)
2. Models measure different value concepts (fee vs production cost)
3. Industry subsector varies (standard EIS vs nuclear EIS)

---

## Sector Analysis

### Sector Representation in Top 10 by Model

| Sector | Claude | Gemini 2.5 | Opus 4.5 | ChatGPT | ChatGPT 5 | o3pro | Perplexity | Gemini 3.0 |
|--------|--------|------------|----------|---------|--------|-------|------------|------------|
| Medical/Pharma | 3 | 2 | 2 | 1 | 0 | 0 | 2 | 4 |
| Financial Services | 4 | 2 | 2 | 3 | 1 | 1 | 3 | 4 |
| Legal | 1 | 1 | 1 | 1 | 0 | 0 | 1 | 1 |
| Technology | 1 | 1 | 2 | 2 | 7 | 2 | 1 | 1 |
| Management Consulting | 1 | 2 | 1 | 1 | 1 | 8 | 1 | 0 |
| Engineering | 0 | 1 | 1 | 1 | 1 | 0 | 1 | 0 |
| Creative/Marketing | 0 | 1 | 0 | 0 | 0 | 0 | 1 | 0 |
| Environmental | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 0 |

**Key Patterns:**
- **ChatGPT 5** is heavily Technology-biased (7/10 top artifacts)
- **o3pro** is heavily Consulting-biased (8/10 top artifacts)
- **Gemini 3.0** is Financial Services + Medical/Pharma focused (8/10 top artifacts)
- **Claude/Gemini 2.5/Perplexity** show more balanced sector distribution
- **Medical/Pharma** appears in Claude/Gemini/Opus/Perplexity/Gemini 3.0 top 10 but absent from GPT/o3pro
- **Gemini 3.0** uniquely includes SPAC and EUA artifacts reflecting 2020-specific events

---

## COVID-19 Impact Analysis

All models that analyzed COVID-19 impacts agreed on directional effects:

### Increased Demand (100% Model Agreement)
- Clinical Trials & Pharmaceutical Regulatory
- Digital Transformation & Cloud Migration
- Bankruptcy & Restructuring
- Cybersecurity Assessments
- Remote Work Infrastructure

### Decreased Demand (100% Model Agreement)
- Commercial Real Estate (Q2-Q3 2020)
- M&A Activity (Q2 2020 - rebounded Q4)
- Trade Shows & Events
- Travel-Related Consulting

### Pandemic-Specific Artifacts Identified
- Gemini 2.5: Emergency restructuring plans spiked
- Claude: Digital transformation timelines compressed 3-5 years
- o3pro: Remote delivery accelerated automation readiness
- ChatGPT 5: Consulting revenue -19% globally; -28% Europe
- Gemini 3.0: EUA dossiers emerged as new artifact type; SPAC boom created unique M&A artifacts

---

## Value Migration: Model Implications

### When to Use Each Model's Values

| Use Case | Recommended Model | Rationale |
|----------|-------------------|-----------|
| **Budgeting R&D projects** | Gemini 2.5 | Captures total lifecycle cost |
| **Negotiating consultant fees** | Claude Sonnet 4.5, ChatGPT 5 | Reflects market billing rates |
| **Benchmarking procurement** | o3pro | Project-level fee focus |
| **Investment analysis** | ChatGPT 5-1 | Financial transaction focus |
| **Identifying automation targets** | o3pro | Includes automation suitability scores |
| **Taxonomy/categorization** | Perplexity | Clean sector/subsector structure |
| **2020-specific baseline** | Perplexity, Gemini 3.0 | 40 source citations with date context |
| **Confidence assessment** | Claude Opus 4.5 | Includes HIGH/MEDIUM/LOW ratings |
| **Premium firm pricing ceiling** | Gemini 3.0 | "Maximum Economic Value" upper bounds |
| **2020 event-specific artifacts** | Gemini 3.0 | SPAC boom, EUA dossiers captured |

---

## Recommendations

### For Researchers
1. **Use multiple models** - Single-model valuations can be misleading
2. **Document valuation philosophy** - Are you measuring cost or fees?
3. **Control for scope** - Define artifact boundaries clearly

### For Practitioners
1. **Gemini values = budget ceiling** - What the full effort could cost
2. **Claude/GPT values = negotiation baseline** - What consultants charge
3. **Variance ratio = risk indicator** - High variance = define scope carefully

### For Future Analysis
1. Add temporal dimension (2020 vs 2024 comparison)
2. Incorporate AI disruption metrics for each artifact
3. Build interactive dashboard for dynamic exploration

---

## Data Files

| File | Description |
|------|-------------|
| `master_artifact_valuations.csv` | Combined valuations from all 8 models |
| `artifact_id_mapping.json` | Name normalization across models |
| `artifact_data_export.csv` | Original Claude vs Gemini comparison |
| `Google Gemini 3.0 Pro with Thinking_2020 Human Artifact Index Research.pdf` | Gemini 3.0 Pro source report |

---

## Appendix: Model-Specific Observations

### Claude Sonnet 4.5
- Most transparent methodology (documented web searches)
- Conservative valuations focus on discrete billing events
- Strong COVID-19 impact analysis embedded in profiles

### Gemini 2.5 Pro
- Highest absolute valuations due to production cost approach
- Excellent for understanding total economic value
- Black-box methodology reduces reproducibility

### Claude Opus 4.5
- Only model with explicit confidence ratings
- Wide ranges reflect genuine uncertainty
- Nuclear/major infrastructure expertise visible

### ChatGPT 5-1
- Most academic approach (34-source bibliography)
- Strong financial transactions expertise
- PDF format limits programmatic analysis

### ChatGPT 5
- PowerPoint-ready format with visualizations
- Category economics summaries useful for presentations
- Technology sector bias may reflect training data

### o3pro
- Unique automation suitability scores (1-5)
- Management consulting lens shapes priorities
- Forward-looking 2025 predictions included

### Perplexity
- Most extensively cited methodology (40 footnotes)
- 111 artifacts in taxonomy, 20 with detailed valuations
- Highest 2020-specificity with contemporary source citations
- Balanced sector representation in top 20
- Values tend toward higher end (Phase III at $60M mid vs Claude's $22.5M)

### Gemini 3.0 Pro
- Unique "Maximum Economic Value" methodology (upper-bound premium billing)
- Visible thinking process (Deep Research with Thinking)
- Strong 2020 temporal specificity (SPAC boom, EUA artifacts)
- 40 source citations with clear bibliography
- Values Clinical Study REPORTS at $250K (document-only, not full trials)
- Uniquely captures 2020-specific artifacts (SPAC Merger Proxy, EUA Dossier)
- Lower absolute values than production-cost models but higher than median-fee models

---

*Analysis generated November 25, 2025*
