# PLAN: Variance Analysis Tab Comprehensive Upgrade

**Created:** 2025-12-03
**Status:** Ready for Review
**Scope:** Dashboard enhancement with new visualizations, statistical analysis, and UX improvements

---

## Executive Summary

Transform the Variance Analysis tab from a basic 3-tier filter view into a comprehensive analytical dashboard with:
- 6 new visualization types
- Statistical rigor (outlier detection, confidence scoring)
- Sector-based analysis
- Model behavior insights
- Interactive exploration tools

**Key Finding:** 227 artifacts have variance ratios from 1.0x to 533x. Current tab shows ranges but doesn't explain WHY models disagree or help users interpret extreme variances.

---

## Phase 1: Quick Wins (Data Ready, Low Effort)

### 1.1 Variance Tier Badges
**File:** `dashboard/index.html` (lines 9910-9979)
**Change:** Add visual badges to table rows

```
HIGH CONSENSUS (<3x)  → Green badge "RELIABLE"
MODERATE (3-10x)      → Yellow badge "SCOPE-DEPENDENT"
EXTREME (>10x)        → Red badge "METHODOLOGY CLASH"
```

**Impact:** Users immediately understand trust level

### 1.2 Model Bias Indicators
**File:** `dashboard/index.html` (tooltip in updateVarianceChart)
**Data Source:** Pre-calculated from analysis

| Model | Avg Value | Bias |
|-------|-----------|------|
| Gemini 2.5 Pro | $15.1M | +86% overvaluation |
| Gemini 3.0 Pro | $1.2M | -88% undervaluation |
| ChatGPT 5 | $4.8M | Balanced |
| Claude Sonnet 4.5 | $5.2M | Balanced |

**Change:** Show bias warning in tooltips for extreme models

### 1.3 Sector Filter Dropdown
**File:** `dashboard/index.html` (add above variance buttons)
**Data:** `artifact.sector` field (75 unique sectors, consolidate to 12 major)

```html
<select id="varianceSectorFilter" onchange="filterVarianceBySector()">
  <option value="all">All Sectors</option>
  <option value="Medical/Pharma">Medical/Pharma (68x avg)</option>
  <option value="Financial Services">Financial Services (12x avg)</option>
  <option value="Legal">Legal (6x avg)</option>
  <!-- ... -->
</select>
```

### 1.4 Methodology Decoder Tags
**File:** `dashboard/index.html` (populateVarianceTable function)
**Change:** Replace hardcoded explanations with systematic tags

| Sector | Tag | Explanation |
|--------|-----|-------------|
| Medical/Pharma | "R&D vs Fee" | Some models count full development cost |
| Engineering | "Scope Scale" | Basic feasibility vs full delivery |
| Financial | "Deal Premium" | Fee scales with transaction size |

### 1.5 Model Count Display
**Current:** Hidden in logic
**Change:** Show "X/12 models valued this artifact" in table

### 1.6 Consensus Highlight Row
**Change:** Add gold highlighting for artifacts with <2x variance and 4+ models

---

## Phase 2: New Visualizations (Medium Effort)

### 2.1 Model Agreement Heatmap
**New Component:** 12x12 matrix showing model pair agreement rates
**Location:** New card below main chart
**Library:** Chart.js matrix plugin or custom canvas

```
           Claude  Gemini  ChatGPT5  Opus45  ...
Claude      100%    15%      95%      87%
Gemini       15%   100%      12%      18%
ChatGPT5     95%    12%     100%      89%
...
```

**Key Insight:** ChatGPT 5 ↔ Claude Sonnet 4.5 = 95% agreement; Gemini 2.5 Pro ↔ Gemini 3.0 Pro = 2% agreement

### 2.2 Sector Variance Treemap
**New Component:** Treemap sized by artifact count, colored by avg variance
**Location:** Toggle option in variance view
**Purpose:** Show which sectors have reliable vs uncertain valuations

### 2.3 Distribution Violin Plots
**New Component:** For selected artifact, show value distribution across models
**Location:** Expand on click in variance table
**Purpose:** Show if variance is from one outlier vs genuine disagreement

### 2.4 Z-Score Outlier Chart
**New Component:** Scatter plot showing which models are statistical outliers
**Data:** Pre-calculate z-scores for each model per artifact
**Purpose:** Identify which model to potentially exclude

### 2.5 Before/After Outlier Exclusion Toggle
**New Feature:** Button to recalculate variance excluding statistical outliers
**Example:** Infrastructure 533x → 66x when Opus45 ($400M) excluded
**Impact:** Shows "consensus range" vs "including edge cases"

### 2.6 Confidence Score Gauge
**New Component:** Composite score combining:
- Model count (more = better)
- Agreement level (lower variance = better)
- Sector reliability (tax > medical)

**Display:** Circular gauge 0-100% per artifact

---

## Phase 3: Statistical Enhancements

### 3.1 Add Statistical Columns to Table
**New Columns:**
- Mean (geometric, handles log scale better)
- Median
- Std Dev
- IQR (Interquartile Range)

### 3.2 Quartile Analysis
**Pre-calculate:** Q1, Q2, Q3, IQR for all 227 artifacts
**Store in:** `dashboard/data/variance_statistics.json`
**Use:** Identify statistical outliers (>1.5×IQR above Q3)

### 3.3 Coefficient of Variation
**Formula:** CV = σ/μ (normalized variance)
**Purpose:** Compare variance across different value scales
**Display:** Sort option in table

### 3.4 Consensus Bands
**Calculate:** 80th/90th percentile ranges
**Display:** Show "typical range" shaded area vs full min-max

---

## Phase 4: UX Improvements

### 4.1 Adjustable Variance Thresholds
**Current:** Hardcoded 10x/3x
**Change:** Slider controls for user-defined thresholds

### 4.2 Search/Filter Bar
**Add:** Text search to find specific artifacts in variance view

### 4.3 Artifact Count Badges
**Add:** Show (N artifacts) next to each filter button

```
[Highest (99)] [Mid-Range (109)] [Lowest (19)]
```

### 4.4 Export Functionality
**Add:** "Download CSV" button for current variance view

### 4.5 Responsive Chart Height
**Current:** Fixed 550px
**Change:** Dynamic based on artifact count (min 400px, max 800px)

### 4.6 Keyboard Navigation
**Add:** Arrow keys to navigate table, Enter to deep dive

---

## Phase 5: Model Comparison Features

### 5.1 Model Pair Validator
**New Modal:** Select 2 models → see where they agree/disagree
**Use Case:** "Are ChatGPT5 and Claude interchangeable?" → "95% yes"

### 5.2 Methodology Grouping View
**New Filter:** Group by valuation approach
- Production Cost models (Gemini)
- Service Fee models (Claude, ChatGPT)
- Hybrid models (Opus45)

### 5.3 Model Reliability Score
**Per Model:** Track accuracy against consensus
**Display:** Star rating in model legend

---

## Implementation Order

### Sprint 1 (Phase 1): Quick Wins ✅ COMPLETED
1. [x] Variance tier badges (RELIABLE, SCOPE-DEPENDENT, METHODOLOGY CLASH)
2. [x] Model bias indicators in tooltips (with extreme bias warnings ⚠️)
3. [x] Sector filter dropdown (20 sectors, sorted by artifact count)
4. [x] Methodology decoder tags (sector-aware + artifact-specific explanations)
5. [x] Model count display (X/12 format with styled badge)
6. [x] Consensus highlight rows (gold border for <2x variance + 4+ models)

**Completed:** 2025-12-03

**Implementation Notes:**
- All changes made directly in inline scripts in `dashboard/index.html`
- Added `MODEL_BIAS` constant with direction/percentage/label for all 12 models
- Added `methodologyTags` object with sector-specific and artifact-specific explanations
- Updated `populateVarianceTable()` to generate 6-column layout
- Updated `showHighVariance()`, `showMidVariance()`, `showLowVariance()` to use filtered artifacts
- Added `populateSectorFilter()`, `filterVarianceBySector()`, `getFilteredArtifacts()` functions
- Chart tooltips now show model bias labels and extreme bias warnings

### Sprint 2 (Phase 2): Core Visualizations
1. [ ] Model agreement heatmap
2. [ ] Sector variance treemap
3. [ ] Distribution expansion on click
4. [ ] Outlier exclusion toggle

**Estimated:** 8-12 hours

### Sprint 3 (Phase 3-4): Statistics & UX
1. [ ] Statistical columns
2. [ ] Pre-calculate variance_statistics.json
3. [ ] Adjustable thresholds
4. [ ] Search/filter bar
5. [ ] Export functionality

**Estimated:** 6-8 hours

### Sprint 4 (Phase 5): Advanced Features
1. [ ] Model pair validator modal
2. [ ] Methodology grouping view
3. [ ] Confidence score gauge

**Estimated:** 6-8 hours

---

## Data Requirements

### New Data File: `variance_statistics.json`
```json
{
  "artifacts": {
    "clinical_trial_phase3": {
      "mean": 28500000,
      "median": 22500000,
      "std_dev": 25000000,
      "q1": 5000000,
      "q3": 60000000,
      "iqr": 55000000,
      "cv": 0.87,
      "outliers": ["gemini30"],
      "consensus_low": 15000000,
      "consensus_high": 40000000,
      "tier": "extreme",
      "methodology_tag": "R&D vs Fee"
    }
  },
  "sectors": {
    "Medical/Pharma": {
      "avg_variance": 68.4,
      "artifact_count": 45,
      "tier": "extreme"
    }
  },
  "model_pairs": {
    "chatgpt5_claude_sonnet45": {
      "agreement_rate": 0.95,
      "avg_variance": 1.36
    }
  }
}
```

### Updates to `model_metadata.json`
Add bias metrics per model:
```json
"claude_sonnet45": {
  "avg_valuation": 5200000,
  "bias_percentage": 2.3,
  "bias_direction": "neutral"
}
```

---

## Key Files to Modify

| File | Changes |
|------|---------|
| `dashboard/index.html` | Lines 1286-1320 (HTML), 9771-10059 (JS functions) |
| `dashboard/data/master_valuations.json` | Add tier/tag fields to artifacts |
| `dashboard/data/model_metadata.json` | Add bias metrics |
| `dashboard/data/variance_statistics.json` | NEW: Pre-calculated stats |

---

## Success Metrics

1. **Comprehension:** Users understand WHY variance exists (not just that it does)
2. **Trust:** Clear indicators of which valuations are reliable
3. **Exploration:** Can drill down by sector, model, methodology
4. **Action:** Can export filtered data for external analysis

---

## Dependencies

- Chart.js (already included)
- Chart.js matrix plugin (for heatmap - optional)
- No backend changes needed
- All data can be pre-calculated and stored in JSON

---

## Questions for User

1. **Priority:** Start with Phase 1 quick wins, or jump to visualizations?
2. **Heatmap:** Use Chart.js matrix plugin or build custom?
3. **Export:** CSV only, or also JSON/Excel?
4. **Mobile:** How important is mobile optimization for new features?
