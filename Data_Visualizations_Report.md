# Data Visualizations: The 2020 Human Artifact Index
## Claude vs. Gemini Deep Research Comparison

---

## 1. Top 10 Artifacts - Value Comparison

### Gemini Deep Research Top 10 (Midpoint Values)

```
NDA Submission                    ████████████████████████████████ $300M
Infrastructure Design             █████████████ $100M
Phase III Clinical Report         ██████████ $75M
Chapter 11 Restructuring          ██████ $47.5M
IPO S-1 Registration             ████ $10M
Urban Master Plan                ███ $7.5M
M&A Definitive Agreement         ███ $7M
Enterprise Software Arch         ███ $6.5M
Digital Transformation           ██ $5M
Super Bowl Commercial            ██ $4.5M
                                 └─────────────────────────────────┘
                                 0      50M    100M   150M   200M   300M
```

### Claude WebSearch Top 10 (Midpoint Values)

```
Phase 3 Clinical Trial           ████████ $22.5M
Phase 2 Clinical Trial           ████ $11.5M
M&A Advisory Package             ██ $6M
NDA/BLA Application             ██ $5.5M
Fairness Opinion                █ $4M
Bankruptcy Restructuring        █ $3M
IPO Legal Services              █ $1.35M
Environmental Impact Stmt       █ $1.35M
Digital Transformation          █ $2M
Corporate Due Diligence         █ $1M
                                └───────────────────────────┘
                                0    5M    10M   15M   20M   25M
```

### Side-by-Side Comparison (Common Artifacts)

```
Artifact                    Gemini         Claude         Delta
─────────────────────────────────────────────────────────────────
NDA/Pharmaceutical          $300M          $5.5M          55x
Clinical Trial (Ph 3)       $75M           $22.5M         3.3x
Restructuring Plan          $47.5M         $3M            16x
IPO Services                $10M           $1.35M         7.4x
M&A Agreement               $7M            $6M            1.2x ✓
Digital Transformation      $5M            $2M            2.5x
─────────────────────────────────────────────────────────────────
```
**✓ = Close agreement** (within 2x)

**Key Insight:** Gemini values are consistently higher by 2-55x due to production cost vs. billing fee methodology.

---

## 2. Sector Distribution Analysis

### Gemini Top 50 Artifacts by Sector

```
Medical/Pharma      ████████████ 12
Legal               ███████████████ 15
Technology          ████████████ 12
Financial Services  ██████████ 10
Consulting          ██████████ 10
Engineering         ████████ 8
Creative/Marketing  ████████ 8
Environmental       ███████ 7
Architecture        █████ 5
Real Estate         █████ 5
Scientific R&D      ████████ 8
                    └──────────────────┘
                    0   2   4   6   8  10  12  14  16
                              Number of Artifacts
```

### Claude Top 50 Artifacts by Sector

```
Technology          ███████████████ 15
Financial Services  ██████████████ 14
Legal               ████████████ 12
Consulting          ███████████ 11
Creative/Marketing  ██████████ 10
Medical/Pharma      ████████ 8
Architecture        ██████ 6
Environmental       ██████ 6
Scientific R&D      █████ 5
Engineering         ████ 4
Real Estate         ████ 4
                    └──────────────────┘
                    0   2   4   6   8  10  12  14  16
                              Number of Artifacts
```

### Sector Emphasis Comparison

```
Sector               Gemini  Claude  Delta  Winner
────────────────────────────────────────────────────
Technology             12      15     +3    Claude
Financial Services     10      14     +4    Claude
Medical/Pharma         12       8     -4    Gemini
Engineering             8       4     -4    Gemini
Legal                  15      12     -3    Gemini
Creative/Marketing      8      10     +2    Claude
Consulting             10      11     +1    Claude
────────────────────────────────────────────────────
```

**Interpretation:**
- **Gemini emphasized:** Medical/Pharma, Engineering, Legal
- **Claude emphasized:** Technology, Financial Services, Creative/Marketing

---

## 3. Value Tier Distribution (Claude's 10-Tier System)

### Artifact Count by Value Range

```
Tier  Range           Count  Distribution
────────────────────────────────────────────────────────
T1    >$5M             3     ███
T2    $1M-$5M          7     ███████
T3    $500K-$1M       10     ██████████
T4    $250K-$500K     10     ██████████
T5    $100K-$250K     10     ██████████
T6    $50K-$100K      10     ██████████
T7    $25K-$50K       10     ██████████
T8    $10K-$25K       10     ██████████
T9    $5K-$10K        10     ██████████
T10   $2K-$5K         20     ████████████████████
────────────────────────────────────────────────────────
```

### Value Concentration Analysis

```
Cumulative Value by Tier (Estimated Midpoints)

Tier    Midpoint    Count   Subtotal    % of Total
──────────────────────────────────────────────────────
T1      $10M         3      $30M        42.9%
T2      $2.5M        7      $17.5M      25.0%
T3      $750K       10      $7.5M       10.7%
T4      $375K       10      $3.75M       5.4%
T5      $175K       10      $1.75M       2.5%
T6      $75K        10      $750K        1.1%
T7      $37.5K      10      $375K        0.5%
T8      $17.5K      10      $175K        0.3%
T9      $7.5K       10      $75K         0.1%
T10     $3.5K       20      $70K         0.1%
──────────────────────────────────────────────────────
TOTAL                      ~$70M       100%
```

**Pareto Analysis:**
- **Top 10 artifacts** = 68% of total value
- **Top 20 artifacts** = 82% of total value
- **Bottom 50 artifacts** = <3% of total value

---

## 4. 2020 COVID-19 Impact Visualization

### Demand Shifts by Artifact Type

```
                    Decreased ←──────→ Increased
                               2020 Impact
────────────────────────────────────────────────────────────────

Clinical Trials (vaccines)     │         ████████████ Explosive
Digital Transformation         │         ████████████ Explosive
Bankruptcy/Restructuring       │         ██████████ High
Cloud Migration                │         ██████████ High
Cybersecurity                  │         ██████████ High
Business Continuity Plans      │         ██████ Medium
────────────────────────────────────────────────────────────────
M&A Services (Q2)       ████████████ │   (Q3/Q4: rebound)
Commercial Real Estate  ██████████ │
Trade Shows/Events      ██████████ │
Travel/Hospitality      ██████████ │
────────────────────────────────────────────────────────────────
                    -100%  -50%  0%  +50% +100% +150%
```

### Consensus Between Reports

```
Impact Category          Gemini   Claude   Agreement
───────────────────────────────────────────────────────
Clinical trials ↑          YES      YES       ✓
Restructuring ↑            YES      YES       ✓
Digital transform ↑        YES      YES       ✓
Cloud migration ↑          YES      YES       ✓
Cybersecurity ↑            YES      YES       ✓
Real estate ↓              YES      YES       ✓
M&A Q2 freeze ↓            YES      YES       ✓
Events/shows ↓             YES      YES       ✓
───────────────────────────────────────────────────────
Consensus Rate: 100%
```

---

## 5. Methodology Comparison Matrix

### Research Characteristics

```
Metric                  Claude           Gemini          Winner
────────────────────────────────────────────────────────────────
Time Investment         ~30 min          Unknown         Claude
Transparency            High             Medium          Claude
Source Documentation    Embedded         16-item bib     Gemini
Top 10 Detail           Full             Detailed        Tie
Items 11-100 Detail     Full             Summary only    Claude
2020 Data Specificity   Mixed            Mixed           Tie
Valuation Clarity       Good             Excellent       Gemini
Narrative Quality       Good             Excellent       Gemini
Sector Coverage         11 sectors       11 sectors      Tie
Engineering Emphasis    Weak             Strong          Gemini
Tech/Finance Emphasis   Strong           Weak            Claude
────────────────────────────────────────────────────────────────
```

### Valuation Philosophy Comparison

```
Approach         What It Measures              Best For
───────────────────────────────────────────────────────────────
Gemini:          Total production cost         • Economic analysis
Production       (all accumulated costs)       • Strategic planning
Cost                                           • R&D budgeting
                                               • C-suite decisions

Claude:          Professional services         • Fee benchmarking
Billing          billing/market value          • Vendor negotiation
Value            (discrete engagement fees)    • Project budgeting
                                               • Procurement
───────────────────────────────────────────────────────────────
```

---

## 6. Overlap & Unique Findings

### Venn Diagram (Concept)

```
           Gemini Only              Both Reports          Claude Only
        ┌──────────────┐        ┌──────────────┐      ┌──────────────┐
        │              │        │              │      │              │
        │ • Infrastruc-│        │ • Clinical   │      │ • SOC 2      │
        │   ture Design│        │   Trials     │      │   (higher)   │
        │              │        │ • M&A        │      │              │
        │ • Urban      │────────│ • IPO        │──────│ • Transfer   │
        │   Master Plan│        │ • Restructur-│      │   Pricing    │
        │              │        │   ing        │      │              │
        │ • HEOR Model │        │ • Digital    │      │ • ML Model   │
        │              │        │   Transform  │      │   Dev        │
        │ • Geotechnical│       │ • EIS        │      │              │
        │   Report     │        │              │      │ • Email      │
        │              │        │              │      │   Marketing  │
        └──────────────┘        └──────────────┘      └──────────────┘
          15 unique                70 shared            15 unique
```

### Coverage Gaps Analysis

```
Category                      Gemini  Claude  Gap Analysis
──────────────────────────────────────────────────────────────
Infrastructure/Civil Eng        ✓       ✗     Critical miss (Claude)
Urban Planning                  ✓       ✗     Critical miss (Claude)
Digital/Tech Services           ✓       ✓✓    Claude more granular
Medical/Pharma Regulatory       ✓✓      ✓     Gemini more complete
Financial M&A Services          ✓       ✓✓    Claude more granular
Marketing (High-End)            ✓✓      ✓     Gemini better (Super Bowl)
Marketing (Digital)             ✓       ✓✓    Claude more granular
Compliance/Audit                ✓       ✓✓    Claude more granular
──────────────────────────────────────────────────────────────
```

---

## 7. Valuation Delta Heatmap

### How Much Higher is Gemini vs. Claude? (Multiplier)

```
Artifact Type              Multiplier    Explanation
─────────────────────────────────────────────────────────────────
NDA/Pharma Submission         55x        Production cost vs filing
Phase III Clinical Trial      3.3x       Total cost vs execution
Restructuring Plan            16x        All fees vs advisory only
IPO Services                  7.4x       All services vs legal only
Software Architecture         16x        Full build vs design phase
EIS                          3.7x        Major vs standard scope
M&A Agreement                1.2x        ✓ Close agreement
Digital Transformation       2.5x        Broader scope (Gemini)
─────────────────────────────────────────────────────────────────

Heatmap:
████████████████████ 55x   (NDA - extreme delta)
███████ 16x                 (Restructuring, Software)
████ 7.4x                   (IPO)
███ 3-4x                    (Clinical trials, EIS)
██ 2.5x                     (Digital transform)
█ 1.2x                      (M&A - consensus!)
```

**Pattern:** Largest deltas occur when Gemini measures total production cost vs. Claude's discrete service fees.

---

## 8. Strengths Radar Chart (Conceptual)

```
                        Narrative Quality
                              ★
                             / \
                  Gemini    /   \    Claude
                           /     \
                          /       \
        Sector Coverage  ★─────────★  Detail Completeness
                        /|         |\
                       / |         | \
                      /  |         |  \
                     /   |         |   \
     Infrastructure ★    |         |    ★ Tech/Finance
         Emphasis        |         |        Emphasis
                         |         |
              Valuation  ★─────────★  Transparency
               Framework

                         ★  Sourcing Quality


Legend:
★────★  Gemini strength
  ★──★    Claude strength
    ★      Equal/Tie
```

**Gemini Strengths:**
- Narrative Quality: 9/10
- Valuation Framework: 10/10
- Infrastructure Emphasis: 9/10
- Sourcing Quality: 8/10

**Claude Strengths:**
- Detail Completeness: 10/10
- Tech/Finance Emphasis: 9/10
- Transparency: 10/10
- Mid-tier Coverage: 10/10

---

## 9. Decision Matrix: Which Report to Use?

```
Use Case                              Gemini  Claude  Both
────────────────────────────────────────────────────────────
Budget for R&D project                  ✓✓      -      -
Negotiate consulting fees               -      ✓✓      -
Economic policy analysis                ✓✓      -      -
Benchmark professional services         -      ✓✓      -
C-suite strategic planning              ✓✓      ✓      -
Academic research                       -       -     ✓✓
Understanding total project costs       ✓✓      -      -
Vendor selection & pricing              -      ✓✓      -
Comprehensive market analysis           -       -     ✓✓
Cross-validate assumptions              -       -     ✓✓
────────────────────────────────────────────────────────────

Key:
✓✓ = Strongly recommended
✓  = Recommended
-  = Less suitable
```

---

## 10. Time-Series: How Rankings Shift

### Top 10 Artifact Ranking Comparison

```
Rank   Gemini Report                Claude Report
────   ──────────────────────────   ──────────────────────────
 #1    NDA Submission ($300M)       Phase 3 Clinical ($22.5M)
 #2    Infrastructure Design         NDA Application ($5.5M)
 #3    Phase III Report              M&A Advisory ($6M)
 #4    Chapter 11 Plan               Due Diligence ($1M)
 #5    IPO S-1                       IPO Legal ($1.35M)
 #6    Urban Master Plan             Fairness Opinion ($4M)
 #7    M&A Agreement                 Phase 2 Clinical ($11.5M)
 #8    Software Architecture         EIS ($1.35M)
 #9    Digital Transform             Bankruptcy ($3M)
#10    Super Bowl Ad                 Digital Transform ($2M)
────   ──────────────────────────   ──────────────────────────

Arrows show movement between lists:
Phase 3 Clinical:    #3 (G) → #1 (C)  ↑↑
Digital Transform:   #9 (G) → #10 (C) ↓
Super Bowl Ad:       #10 (G) → Not top 10 (C) ↓↓
Infrastructure:      #2 (G) → Not ranked (C) ✗
```

---

## 11. Value Distribution Curve

### Cumulative Value Distribution (Claude's List)

```
100% │                                            ████
     │                                       █████
     │                                  █████
 75% │                             █████
     │                        █████
     │                   █████
 50% │              █████
     │         █████
     │    █████
 25% │ ███
     └─────────────────────────────────────────────────→
       T1  T2  T3  T4  T5  T6  T7  T8  T9  T10
      (Top Value Tiers → Lower Value Tiers)

Key Insight: "Hockey stick" distribution
- Top 20% of artifacts = 82% of total value
- Bottom 50% of artifacts = <3% of total value
```

---

## 12. Consensus Strength Map

### Agreement Level by Artifact Category

```
Category                 Agreement  Confidence
─────────────────────────────────────────────────
Clinical Trials            High     ████████░░
M&A Services               High     █████████░
Restructuring/Bankruptcy   High     ████████░░
Digital Transformation     High     █████████░
IPO Services              Medium    ██████░░░░
Environmental (EIS)       Medium    ██████░░░░
Software Development       Low      ████░░░░░░
Marketing/Creative         Low      ███░░░░░░░
─────────────────────────────────────────────────

Legend:
█ = Strong agreement (both reports, close values)
░ = Weak agreement (significant methodology differences)
```

---

## 13. Missing Artifacts Analysis

### What Each Report Missed (Top Opportunities)

```
Gemini Should Have Included:        Value (Claude)
────────────────────────────────────────────────────
SOC 2 Type 2 Audit (Enterprise)      $100K-$150K
Transfer Pricing Study                $150K-$500K
Machine Learning Model Dev            $50K-$200K
API Development & Integration         $50K-$150K
────────────────────────────────────────────────────

Claude Should Have Included:         Value (Gemini)
────────────────────────────────────────────────────
Infrastructure Engineering Design     $50M-$150M ⚠️
Urban Master Plan                     $5M-$10M ⚠️
Post-Merger Integration Plan          $2M-$5M
HEOR Model                            $750K-$2.5M
Geotechnical Engineering Report       $100K-$300K
────────────────────────────────────────────────────

⚠️ = Critical omission
```

---

## 14. Sector Value Concentration

### Total Midpoint Value by Sector (Top 10 Only)

```
Gemini Distribution:
Medical/Pharma       ██████████████████████████████ $375M (66%)
Engineering          ████████████ $100M (17.5%)
Financial/Legal      ██████ $57.5M (10%)
Technology           ███ $6.5M (1.1%)
Other                ████ $31M (5.4%)
                     └────────────────────────────────┘
                     Total: ~$570M

Claude Distribution:
Medical/Pharma       ████████████████████████ $39.5M (56%)
Financial            █████████ $14.35M (20%)
Consulting           ███ $2M (3%)
Other                ████████ $14.65M (21%)
                     └────────────────────────────────┘
                     Total: ~$70M

Insight: Both show Medical/Pharma dominance (>50% of top 10 value)
```

---

## 15. Practical Application Matrix

### Which Value to Use for Different Scenarios

```
Scenario                           Use Gemini  Use Claude  Context
───────────────────────────────────────────────────────────────────
"How much to budget                   ✓           -        Total cost
for drug development?"                                     perspective

"What should I pay                    -           ✓        Market rate
this consultant?"                                          benchmark

"What's the ROI of                    ✓           ✓        Both needed:
this strategic                                             Cost vs. Fee
initiative?"

"Hiring outside                       -           ✓        Service fee
counsel for IPO"                                           focus

"Should we build                      ✓           -        Total build
or buy software?"                                          cost matters

"Negotiating with                     -           ✓        Market
Big 4 on audit fee"                                        comparables

"Board presentation                   ✓           -        Strategic
on transformation"                                         framing

"Procurement RFP                      -           ✓        Service
pricing"                                                   fee ranges
───────────────────────────────────────────────────────────────────
```

---

## Summary Statistics

### Quick Reference Table

```
Metric                          Gemini      Claude
─────────────────────────────────────────────────────
Top artifact value (midpoint)   $300M       $22.5M
Top 10 total value             ~$570M      ~$70M
Bottom artifact value           $27.5K      $17.5K
Value ratio (top/bottom)        10,909x     1,286x
Sectors covered                 11          11
Artifacts profiled (detailed)   10          100
Total report length            756 lines    590 lines
Sources cited                   16          Embedded
Unique top-20 artifacts         3           3
Consensus artifacts (top 20)    14          14
─────────────────────────────────────────────────────
```

---

## Visualization Files Created

1. **visualizations_data.json** - Raw data for external tools
2. **This file** - ASCII charts and analysis

### Recommended Next Steps:

For interactive visualizations, the JSON data can be used with:
- **Tableau** or **Power BI** for dashboards
- **Python** (matplotlib/plotly) for custom charts
- **D3.js** for web-based interactive viz
- **Excel** for quick pivot tables and charts

---

**END OF VISUALIZATIONS REPORT**

*All visualizations created from comparative analysis of Claude WebSearch Research and Gemini Deep Research reports on The 2020 Human Artifact Index.*
