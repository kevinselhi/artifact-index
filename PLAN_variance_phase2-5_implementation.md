# PLAN: Variance Analysis Phase 2-5 Implementation

**Created:** 2025-12-03
**Status:** Ready for Implementation
**Prerequisites:** Phase 1 Complete ✅

---

## Executive Summary

This plan details the implementation of Phase 2-5 features for the Variance Analysis tab, based on comprehensive code review and data architecture analysis by specialized agents.

**Total Scope:** 12 features across 4 phases
**Estimated Effort:** 20-30 hours
**Priority:** Ordered by complexity vs. value ratio

---

## Implementation Priority Order

| # | Feature | Phase | Complexity | Value | Lines | Dependencies |
|---|---------|-------|------------|-------|-------|--------------|
| 1 | Search/Filter Bar | 4.2 | Easy | High | ~50 | None |
| 2 | Statistical Columns | 3.1 | Easy | Medium | ~100 | None |
| 3 | Distribution Modal | 2.3 | Medium | High | ~150 | None |
| 4 | CSV Export | 4.4 | Easy | Medium | ~50 | None |
| 5 | Outlier Exclusion Toggle | 2.5 | Medium | High | ~200 | None |
| 6 | Adjustable Thresholds | 4.1 | Medium | Medium | ~150 | None |
| 7 | Confidence Score Gauge | 2.6 | Medium | Medium | ~100 | None |
| 8 | Model Pair Validator | 5.1 | Hard | High | ~300 | model_pair_agreement.json |
| 9 | Model Agreement Heatmap | 2.1 | Hard | High | ~400 | Chart.js Matrix plugin |
| 10 | Sector Variance Treemap | 2.2 | V.Hard | Medium | ~500 | Chart.js Treemap plugin |
| 11 | Methodology Grouping | 5.2 | Hard | Medium | ~300 | None |
| 12 | Dynamic Chart Height | 4.5 | Easy | Low | ~50 | None |

---

## Data Architecture Requirements

### New Data Files to Generate

#### 1. Enhanced `master_valuations.json`
Add to each artifact:
```json
{
  "id": "clinical_trial_phase3",
  "statistics": {
    "count": 9,
    "mean": 24856944,
    "median": 19500000,
    "geometric_mean": 12893847,
    "std_dev": 24389582,
    "cv": 0.981,
    "iqr": 24750000,
    "q1": 11000000,
    "q2": 19500000,
    "q3": 36500000
  },
  "outliers": {
    "z_score": {"gemini": 2.05},
    "iqr": {"gemini30": "low"}
  },
  "confidence_score": {
    "overall": 0.72,
    "components": {
      "model_agreement": 0.65,
      "coverage": 0.75,
      "variance": 0.43,
      "sector_consistency": 0.85
    }
  }
}
```

#### 2. NEW: `model_pair_agreement.json` (~150KB)
```json
{
  "metadata": {
    "generated": "2025-12-03",
    "models": ["chatgpt5", "claude_sonnet45", ...],
    "total_pairs": 66
  },
  "pairwise_agreement": {
    "claude_sonnet45": {
      "chatgpt5": {
        "artifacts_compared": 183,
        "agreements_20pct": 78,
        "agreement_rate": 0.426,
        "correlation": 0.89,
        "examples": {
          "high_agreement": ["tax_opinion", "financial_audit"],
          "high_disagreement": ["nda_application", "infrastructure_engineering"]
        }
      }
    }
  },
  "methodology_groups": {
    "service_fee": {
      "models": ["claude_sonnet45", "chatgpt5", "chatgpt51"],
      "intra_group_agreement": 0.42
    },
    "production_cost": {
      "models": ["gemini"],
      "intra_group_agreement": 1.0
    },
    "hybrid": {
      "models": ["opus45", "perplexity", "gemini30"],
      "intra_group_agreement": 0.35
    }
  },
  "reliability_scores": {
    "claude_sonnet45": { "score": 0.74, "rank": 1 },
    "opus45": { "score": 0.71, "rank": 2 }
  }
}
```

#### 3. NEW: `sector_variance.json` (~80KB)
```json
{
  "sectors": [
    {
      "sector": "Medical/Pharma",
      "artifact_count": 32,
      "total_value": 1567890000,
      "avg_value": 48996562,
      "variance_stats": {
        "avg_variance_ratio": 89.43,
        "high_variance_count": 8,
        "low_variance_count": 18
      },
      "top_artifacts": [
        {"id": "phase3_clinical_trial", "variance": 352.9}
      ],
      "consensus_level": "low"
    }
  ]
}
```

### Data Generation Script

Create `dashboard/scripts/compute_variance_statistics.py`:
- Zero external dependencies (Python stdlib only)
- Generates all 3 data files
- Supports --dry-run and --verbose flags
- Creates automatic backups
- Runtime: ~10 seconds

---

## Sprint 1: Quick Wins (4-6 hours)

### Feature 1: Search/Filter Bar
**File:** `dashboard/index.html`
**Location:** Add above variance chart (line ~1290)

```html
<!-- Search Bar -->
<div class="card full-width" style="margin-bottom: 20px;">
    <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 250px;">
            <input type="text" id="varianceSearchBar"
                   placeholder="Search artifacts..."
                   onkeyup="filterVarianceBySearch(this.value)"
                   style="width: 100%; padding: 10px; background: var(--bg-dark);
                          border: 1px solid var(--border); border-radius: 6px;
                          color: var(--text-primary); font-size: 0.9em;">
        </div>
    </div>
</div>
```

```javascript
// Search filter function
let searchQuery = '';

function filterVarianceBySearch(query) {
    searchQuery = query.toLowerCase().trim();

    // Re-trigger current variance view
    const highBtn = document.getElementById('highVarianceBtn');
    const midBtn = document.getElementById('midVarianceBtn');
    const lowBtn = document.getElementById('lowVarianceBtn');

    if (highBtn.classList.contains('active')) showHighVariance();
    else if (midBtn.classList.contains('active')) showMidVariance();
    else if (lowBtn.classList.contains('active')) showLowVariance();
}

// Update getFilteredArtifacts to include search
function getFilteredArtifacts() {
    let filtered = currentVarianceSector === 'all'
        ? artifacts
        : artifacts.filter(a => (a.sector || a.industry || 'Other') === currentVarianceSector);

    if (searchQuery) {
        filtered = filtered.filter(a =>
            a.name.toLowerCase().includes(searchQuery) ||
            (a.id && a.id.toLowerCase().includes(searchQuery))
        );
    }

    return filtered;
}
```

### Feature 2: Statistical Columns
**Location:** Modify `populateVarianceTable()` function

Add to table headers:
```html
<th>Mean</th>
<th>Median</th>
<th>Std Dev</th>
```

Add calculation functions:
```javascript
function calculateMean(values) {
    return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calculateStdDev(values) {
    const mean = calculateMean(values);
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return Math.sqrt(calculateMean(squaredDiffs));
}
```

Update table row generation:
```javascript
const vals = values.map(([k, v]) => v);
const mean = calculateMean(vals);
const median = calculateMedian(vals);
const stdDev = calculateStdDev(vals);

// Add columns to row
<td>${formatCurrency(mean)}</td>
<td>${formatCurrency(median)}</td>
<td>${formatCurrency(stdDev)}</td>
```

### Feature 3: CSV Export
**Location:** Add button next to sector filter

```html
<button onclick="exportVarianceToCSV()"
        style="padding: 8px 16px; background: var(--opus45); color: #1a1a2e;
               border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
    Export CSV
</button>
```

```javascript
function exportVarianceToCSV() {
    const filtered = getFilteredArtifacts();
    const multiModel = filtered.filter(a =>
        Object.values(a.valuations).filter(v => v !== null).length >= 2
    );

    // Build CSV content
    const headers = ['Artifact', 'Tier', 'Models', 'Variance', 'Min', 'Max', 'Mean', 'Median'];
    const rows = multiModel.map(a => {
        const values = Object.entries(a.valuations).filter(([k, v]) => v !== null);
        const vals = values.map(([k, v]) => v);
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        const mean = calculateMean(vals);
        const median = calculateMedian(vals);
        const tier = (a.variance_ratio || 1) > 10 ? 'METHODOLOGY CLASH' :
                     (a.variance_ratio || 1) > 3 ? 'SCOPE-DEPENDENT' : 'RELIABLE';

        return [
            `"${a.name}"`,
            tier,
            values.length,
            (a.variance_ratio || 1).toFixed(2),
            min,
            max,
            mean.toFixed(0),
            median.toFixed(0)
        ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `variance_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}
```

---

## Sprint 2: Interactive Features (6-8 hours)

### Feature 4: Distribution Modal
**Purpose:** Show value distribution per artifact on click

```html
<!-- Distribution Modal -->
<div id="distributionModal" style="display: none; position: fixed; top: 0; left: 0;
     width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000;">
    <div style="max-width: 900px; margin: 50px auto; background: var(--bg-card);
                border-radius: 12px; padding: 30px; position: relative;">
        <button onclick="closeDistributionModal()"
                style="position: absolute; top: 15px; right: 15px; background: transparent;
                       border: none; color: var(--text-secondary); font-size: 1.5em; cursor: pointer;">
            &times;
        </button>
        <h3 id="distributionTitle" style="margin-bottom: 20px;">Value Distribution</h3>
        <div class="chart-container" style="height: 400px;">
            <canvas id="distributionChart"></canvas>
        </div>
        <div id="distributionStats" style="margin-top: 20px; display: grid;
             grid-template-columns: repeat(4, 1fr); gap: 15px;"></div>
    </div>
</div>
```

```javascript
let distributionChart = null;

function showArtifactDistribution(artifactId) {
    const artifact = artifacts.find(a => a.id === artifactId);
    if (!artifact) return;

    const values = Object.entries(artifact.valuations)
        .filter(([k, v]) => v !== null)
        .sort((a, b) => b[1] - a[1]);

    document.getElementById('distributionTitle').textContent =
        `Value Distribution: ${artifact.name}`;

    const ctx = document.getElementById('distributionChart');
    if (distributionChart) distributionChart.destroy();

    distributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: values.map(([k]) => modelNames[k]),
            datasets: [{
                label: 'Valuation',
                data: values.map(([k, v]) => v),
                backgroundColor: values.map(([k]) => modelColors[k]),
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'logarithmic',
                    title: { display: true, text: 'Value (USD)', color: '#a0a0a0' }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => formatCurrency(ctx.raw)
                    }
                }
            }
        }
    });

    // Update stats panel
    const vals = values.map(([k, v]) => v);
    document.getElementById('distributionStats').innerHTML = `
        <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px;">
            <div style="font-size: 0.8em; color: var(--text-secondary);">Mean</div>
            <div style="font-size: 1.2em; font-weight: 600;">${formatCurrency(calculateMean(vals))}</div>
        </div>
        <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px;">
            <div style="font-size: 0.8em; color: var(--text-secondary);">Median</div>
            <div style="font-size: 1.2em; font-weight: 600;">${formatCurrency(calculateMedian(vals))}</div>
        </div>
        <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px;">
            <div style="font-size: 0.8em; color: var(--text-secondary);">Std Dev</div>
            <div style="font-size: 1.2em; font-weight: 600;">${formatCurrency(calculateStdDev(vals))}</div>
        </div>
        <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px;">
            <div style="font-size: 0.8em; color: var(--text-secondary);">Range</div>
            <div style="font-size: 1.2em; font-weight: 600;">${(Math.max(...vals) / Math.min(...vals)).toFixed(1)}x</div>
        </div>
    `;

    document.getElementById('distributionModal').style.display = 'block';
}

function closeDistributionModal() {
    document.getElementById('distributionModal').style.display = 'none';
    if (distributionChart) {
        distributionChart.destroy();
        distributionChart = null;
    }
}
```

### Feature 5: Outlier Exclusion Toggle
**Purpose:** Recalculate variance excluding statistical outliers (>2σ)

```html
<!-- Outlier Toggle Card -->
<div class="card full-width" style="margin-top: 20px; background: rgba(129,178,154,0.1);
     border-left: 3px solid #81B29A;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
            <strong>Outlier Analysis</strong>
            <div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 5px;">
                Exclude extreme model valuations (>2σ from mean) to see consensus-adjusted variance
            </div>
        </div>
        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <input type="checkbox" id="outlierExclusionToggle" onchange="toggleOutlierExclusion()">
            <span>Exclude Outliers</span>
        </label>
    </div>
    <div id="outlierSummary" style="margin-top: 15px; padding: 10px;
         background: rgba(255,255,255,0.05); border-radius: 6px; font-size: 0.85em; display: none;">
    </div>
</div>
```

```javascript
let outlierExclusionEnabled = false;

function toggleOutlierExclusion() {
    outlierExclusionEnabled = document.getElementById('outlierExclusionToggle').checked;

    // Show summary panel
    const summaryPanel = document.getElementById('outlierSummary');
    summaryPanel.style.display = outlierExclusionEnabled ? 'block' : 'none';

    if (outlierExclusionEnabled) {
        // Count outliers
        let totalOutliers = 0;
        const outlierModels = {};

        artifacts.forEach(a => {
            const values = Object.entries(a.valuations).filter(([k, v]) => v !== null);
            if (values.length < 3) return;

            const vals = values.map(([k, v]) => v);
            const mean = calculateMean(vals);
            const stdDev = calculateStdDev(vals);

            values.forEach(([model, value]) => {
                const zScore = Math.abs((value - mean) / stdDev);
                if (zScore > 2) {
                    totalOutliers++;
                    outlierModels[model] = (outlierModels[model] || 0) + 1;
                }
            });
        });

        const topOutliers = Object.entries(outlierModels)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([model, count]) => `${modelNames[model]}: ${count}`)
            .join(', ');

        summaryPanel.innerHTML = `
            <strong>${totalOutliers}</strong> outlier valuations excluded.
            Most frequent: ${topOutliers}
        `;
    }

    // Re-trigger current view
    if (document.getElementById('highVarianceBtn').classList.contains('active')) showHighVariance();
    else if (document.getElementById('midVarianceBtn').classList.contains('active')) showMidVariance();
    else showLowVariance();
}

function getValuationsWithoutOutliers(artifact) {
    const values = Object.entries(artifact.valuations).filter(([k, v]) => v !== null);
    if (!outlierExclusionEnabled || values.length < 3) return values;

    const vals = values.map(([k, v]) => v);
    const mean = calculateMean(vals);
    const stdDev = calculateStdDev(vals);

    return values.filter(([model, value]) => {
        const zScore = Math.abs((value - mean) / stdDev);
        return zScore <= 2;
    });
}
```

---

## Sprint 3: Advanced Visualizations (8-10 hours)

### Feature 6: Model Agreement Heatmap
**Requires:** Chart.js Matrix plugin OR custom canvas implementation

```html
<script src="https://cdn.jsdelivr.net/npm/chartjs-chart-matrix@2"></script>

<div class="card full-width" style="margin-top: 20px;">
    <div class="card-title">
        <span>Model Agreement Heatmap</span>
        <span style="font-size: 0.8em; color: var(--text-secondary);">
            Darker = higher agreement (within 20% of each other)
        </span>
    </div>
    <div class="chart-container" style="height: 600px;">
        <canvas id="agreementHeatmapChart"></canvas>
    </div>
</div>
```

```javascript
let agreementHeatmapChart = null;

function initAgreementHeatmap() {
    const matrix = calculateModelAgreementMatrix();
    const models = Object.keys(modelNames);

    const ctx = document.getElementById('agreementHeatmapChart');
    if (agreementHeatmapChart) agreementHeatmapChart.destroy();

    // Flatten matrix for Chart.js
    const data = [];
    models.forEach((m1, i) => {
        models.forEach((m2, j) => {
            data.push({
                x: j,
                y: i,
                v: matrix[m1]?.[m2] || 0
            });
        });
    });

    agreementHeatmapChart = new Chart(ctx, {
        type: 'matrix',
        data: {
            datasets: [{
                data: data,
                backgroundColor: (ctx) => {
                    const value = ctx.raw.v;
                    const alpha = 0.2 + (value * 0.8);
                    return `rgba(129, 178, 154, ${alpha})`;
                },
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
                width: ({ chart }) => (chart.chartArea.width / models.length) - 2,
                height: ({ chart }) => (chart.chartArea.height / models.length) - 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'category',
                    labels: models.map(m => modelNames[m]),
                    ticks: { color: '#a0a0a0', font: { size: 9 } },
                    grid: { display: false }
                },
                y: {
                    type: 'category',
                    labels: models.map(m => modelNames[m]),
                    ticks: { color: '#a0a0a0', font: { size: 9 } },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: () => '',
                        label: (ctx) => {
                            const m1 = models[ctx.raw.y];
                            const m2 = models[ctx.raw.x];
                            return `${modelNames[m1]} ↔ ${modelNames[m2]}: ${(ctx.raw.v * 100).toFixed(0)}% agreement`;
                        }
                    }
                }
            }
        }
    });
}

function calculateModelAgreementMatrix() {
    const models = Object.keys(modelNames);
    const matrix = {};

    models.forEach(m1 => {
        matrix[m1] = {};
        models.forEach(m2 => {
            if (m1 === m2) {
                matrix[m1][m2] = 1;
                return;
            }

            // Calculate agreement rate
            let agreements = 0;
            let comparisons = 0;

            artifacts.forEach(a => {
                const v1 = a.valuations[m1];
                const v2 = a.valuations[m2];
                if (v1 && v2) {
                    comparisons++;
                    const ratio = Math.max(v1, v2) / Math.min(v1, v2);
                    if (ratio <= 1.2) agreements++; // Within 20%
                }
            });

            matrix[m1][m2] = comparisons > 0 ? agreements / comparisons : 0;
        });
    });

    return matrix;
}
```

### Feature 7: Model Pair Validator Modal
**Purpose:** Deep comparison of any two models

```javascript
function showModelPairValidator(model1 = 'claude_sonnet45', model2 = 'chatgpt5') {
    // Build comparison data
    const comparisons = [];

    artifacts.forEach(a => {
        const v1 = a.valuations[model1];
        const v2 = a.valuations[model2];
        if (v1 && v2) {
            const ratio = Math.max(v1, v2) / Math.min(v1, v2);
            comparisons.push({
                artifact: a.name,
                id: a.id,
                value1: v1,
                value2: v2,
                ratio: ratio,
                agrees: ratio <= 1.2
            });
        }
    });

    const agreementRate = comparisons.filter(c => c.agrees).length / comparisons.length;

    // Update modal content
    document.getElementById('model1Header').textContent = modelNames[model1];
    document.getElementById('model2Header').textContent = modelNames[model2];

    // Render gauge
    renderConfidenceGauge(agreementRate);

    // Update verdict
    const verdictEl = document.getElementById('agreementVerdict');
    if (agreementRate >= 0.8) {
        verdictEl.textContent = 'High Agreement - Models are interchangeable';
        verdictEl.style.color = 'var(--variance-low)';
    } else if (agreementRate >= 0.5) {
        verdictEl.textContent = 'Moderate Agreement - Use with caution';
        verdictEl.style.color = 'var(--variance-medium)';
    } else {
        verdictEl.textContent = 'Low Agreement - Different methodologies';
        verdictEl.style.color = 'var(--variance-high)';
    }

    // Populate table (top disagreements)
    const table = document.getElementById('pairComparisonTable');
    const topDisagreements = comparisons
        .sort((a, b) => b.ratio - a.ratio)
        .slice(0, 10);

    table.innerHTML = topDisagreements.map(c => `
        <tr>
            <td><span onclick="showArtifactDistribution('${c.id}')"
                      style="cursor: pointer; text-decoration: underline dotted;">
                ${c.artifact}
            </span></td>
            <td style="color: ${modelColors[model1]}">${formatCurrency(c.value1)}</td>
            <td style="color: ${modelColors[model2]}">${formatCurrency(c.value2)}</td>
            <td class="${c.ratio > 3 ? 'variance-high' : 'variance-medium'}">${c.ratio.toFixed(1)}x</td>
            <td style="font-size: 0.85em; color: var(--text-secondary);">
                ${getMethodologyTag({id: c.id, sector: ''}, c.ratio).tag}
            </td>
        </tr>
    `).join('');

    document.getElementById('modelValidatorModal').style.display = 'block';
}
```

---

## Performance Optimizations

### 1. Chart Memory Management
```javascript
// Destroy charts when leaving variance view
function destroyVarianceCharts() {
    [varianceChart, distributionChart, agreementHeatmapChart].forEach(chart => {
        if (chart) chart.destroy();
    });
}

// Add to tab switch handler
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        if (!tab.classList.contains('active')) {
            destroyVarianceCharts();
        }
    });
});
```

### 2. Calculation Memoization
```javascript
const calculationCache = new Map();

function memoize(key, calculator) {
    if (!calculationCache.has(key)) {
        calculationCache.set(key, calculator());
    }
    return calculationCache.get(key);
}

// Usage
function calculateModelAgreementMatrix() {
    return memoize('agreement_matrix', () => {
        // Expensive calculation
    });
}

// Clear on data reload
function loadData() {
    calculationCache.clear();
    // ... existing load
}
```

### 3. Resize Debouncing
```javascript
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (varianceChart) updateVarianceChart(currentArtifacts, currentVarianceType);
        if (agreementHeatmapChart) initAgreementHeatmap();
    }, 250);
});
```

---

## Testing Checklist

### Functional Tests
- [ ] Search filters artifacts correctly (partial match)
- [ ] Statistics columns show accurate values
- [ ] CSV export includes all visible columns
- [ ] Distribution modal opens/closes properly
- [ ] Outlier toggle recalculates variance
- [ ] Heatmap renders 12x12 matrix
- [ ] Model pair validator shows correct agreement

### Performance Tests
- [ ] Initial load < 2 seconds
- [ ] View switch < 500ms
- [ ] Filter/search < 200ms
- [ ] Chart render < 300ms
- [ ] Memory usage < 200MB

### Cross-browser Tests
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari / Chrome

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `dashboard/index.html` | Modify | Add all JS functions and HTML |
| `dashboard/scripts/compute_variance_statistics.py` | Create | Data generation script |
| `dashboard/data/variance_statistics.json` | Create | Enhanced artifact stats |
| `dashboard/data/model_pair_agreement.json` | Create | 66 pair comparison data |
| `dashboard/data/sector_variance.json` | Create | Sector aggregations |

---

## Success Criteria

1. **Phase 2 Complete:** 4 new visualizations rendering correctly
2. **Phase 3 Complete:** Statistics visible in table, accurate to 2 decimal places
3. **Phase 4 Complete:** Search, export, thresholds all functional
4. **Phase 5 Complete:** Model comparison modal provides actionable insights
5. **Performance:** All targets met (see Testing Checklist)

---

## Next Steps

1. Run data generation script to create new JSON files
2. Implement Sprint 1 quick wins (Search, Stats, Export)
3. Test and commit Sprint 1
4. Proceed to Sprint 2 interactive features
5. Test and commit Sprint 2
6. Implement Sprint 3 visualizations
7. Final testing and deployment
