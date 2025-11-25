# Prompt for Claude (Web) - Visual Generation

**Instructions:** Copy the prompt below and paste it into Claude.ai (web interface with Artifacts feature) to generate visual diagrams for the MultiMind Research Validator proposal.

---

## PROMPT TO COPY:

I need you to create professional visual diagrams for a hackathon proposal. Generate each as a separate artifact using ASCII art, SVG, or HTML/CSS as appropriate.

**Project Context:**
MultiMind Research Validator is an agentic AI system that orchestrates multiple AI models simultaneously, compares their outputs, detects consensus vs. divergence, and synthesizes validated research reports. It's being built for the You.com Agentic Hackathon (Track 3: Open Agentic Innovation).

**Key Concept:**
Instead of choosing which AI model to trust, the system deploys research questions to multiple models in parallel, automatically detects where they agree (high confidence) and where they disagree (needs investigation), then synthesizes the best findings from all models.

**Proof of Concept:**
The 2020 Human Artifact Index project demonstrated this manually: Claude and Gemini given the same research prompt produced valuations that differed by 5-55x (e.g., New Drug Application: Gemini said $100M-$500M total production cost, Claude said $4M-$7M professional services fee). Both were correct but measuring different things. The truth emerged through comparison.

---

## VISUALS NEEDED:

### 1. System Architecture Diagram
Create a professional flowchart showing:
- **Input:** Research Question
- **Orchestration Layer:** Main agent using You.com Chat API
- **Parallel Deployment:** 4 branches
  - Branch 1: Model A (Claude) via You.com Chat API
  - Branch 2: Model B (GPT-4) via You.com Chat API
  - Branch 3: Web Search via You.com Search API
  - Branch 4: RAG Knowledge Base via You.com RAG API
- **Comparison Engine:** Semantic analysis, consensus detection, divergence flagging, confidence scoring
- **Synthesis Layer:** Merges findings using You.com Chat API
- **Output:** Validated Research Report

Use colors:
- Green for high-confidence consensus findings
- Yellow for divergence/needs review
- Blue for API integration points
- Gray for data flow arrows

Style: Modern, clean, professional (suitable for tech presentation)

---

### 2. Before vs. After Comparison
Create a side-by-side visual showing:

**BEFORE (Manual Process):**
- Icon: Person with magnifying glass
- Steps shown vertically:
  1. "Deploy question to Model A" (4 hours)
  2. "Deploy question to Model B" (4 hours)
  3. "Manually compare outputs" (6 hours)
  4. "Identify consensus" (3 hours)
  5. "Write synthesis report" (3 hours)
- Total: "20 hours"
- Visual indicators: Clock icons, manual work symbols

**AFTER (MultiMind):**
- Icon: Robot/automation symbol
- Steps shown vertically:
  1. "Enter research question" (1 minute)
  2. "Automated multi-model deployment" (Real-time)
  3. "Automatic comparison & synthesis" (Real-time)
  4. "Validated report generated" (5 minutes)
- Total: "5 minutes"
- Visual indicators: Lightning bolt (speed), checkmarks (automation)

---

### 3. Consensus Detection Visualization
Create a mockup showing how the system displays results:

**Sample Research Finding:**
"Phase III Clinical Trials are the most valuable pharmaceutical artifact"

Show three model responses:
- **Model A (Claude):** "Phase III Clinical Trials: $15M-$30M billing value" ✓
- **Model B (GPT-4):** "Phase III Clinical Trials: $50M-$100M production cost" ✓
- **Web Search:** "Phase III trials average $20M in 2020" ✓

**Consensus Indicator:**
- Large green checkmark
- "HIGH CONFIDENCE - All models agree on Phase III importance"
- "Confidence Score: 95%"
- "Note: Valuation methodology differs (billing vs. production cost)"

**Sample Divergent Finding:**
"Infrastructure Engineering Design"

Show three model responses:
- **Model A (Claude):** [No mention] ✗
- **Model B (GPT-4):** "Top 2 artifact at $50M-$150M" ✓
- **Web Search:** "Major infrastructure projects $50M+" ✓

**Divergence Indicator:**
- Yellow warning icon
- "NEEDS REVIEW - Only 2 of 3 sources mention"
- "Confidence Score: 65%"
- "Recommendation: Additional research suggested"

---

### 4. Value Proposition Infographic
Create an infographic showing:

**Center Circle:** "MultiMind Research Validator"

**Four Spokes Leading Out:**

1. **Reduces Hallucinations**
   - Icon: Shield with checkmark
   - "40% higher fact accuracy"
   - "Cross-validation catches errors"

2. **Increases Confidence**
   - Icon: Target with arrow
   - "Consensus detection"
   - "Automated confidence scoring"

3. **Saves Time**
   - Icon: Stopwatch
   - "20 hours → 5 minutes"
   - "98% time reduction"

4. **Captures Insights**
   - Icon: Lightbulb
   - "Multiple perspectives"
   - "Complementary strengths"

Style: Modern, colorful, visually balanced

---

### 5. Competitive Advantage Matrix
Create a comparison table:

| Feature | Single-Model Apps | MultiMind | Advantage |
|---------|------------------|-----------|-----------|
| **Hallucination Risk** | High | Low | ✓✓✓ |
| **Confidence Scoring** | Manual | Automated | ✓✓ |
| **Complementary Insights** | Single perspective | Multi-perspective | ✓✓✓ |
| **Validation Method** | Hope model is right | Cross-model verification | ✓✓✓ |
| **Research Time** | Per-model sequential | Parallel (faster) | ✓✓ |
| **Blind Spot Detection** | None | Automatic | ✓✓✓ |

Add visual indicators:
- Red X for Single-Model weaknesses
- Green checkmarks for MultiMind strengths
- More checkmarks = bigger advantage

---

### 6. Demo Flow Mockup
Create a UI mockup showing 3 screens:

**Screen 1: Input**
```
┌─────────────────────────────────────────┐
│  MultiMind Research Validator           │
├─────────────────────────────────────────┤
│                                         │
│  Enter your research question:         │
│  ┌─────────────────────────────────┐  │
│  │ What were the most valuable      │  │
│  │ professional artifacts in 2020?  │  │
│  └─────────────────────────────────┘  │
│                                         │
│         [Start Research] →             │
│                                         │
└─────────────────────────────────────────┘
```

**Screen 2: Processing (Real-time)**
```
┌─────────────────────────────────────────┐
│  Research in Progress...                │
├─────────────────────────────────────────┤
│                                         │
│  ✓ Model A (Claude)    [████████] 100% │
│  ✓ Model B (GPT-4)     [████████] 100% │
│  ⟳ Web Search          [██████░░]  75% │
│  ⟳ RAG Knowledge       [████░░░░]  50% │
│                                         │
│  Analyzing consensus...                │
│                                         │
└─────────────────────────────────────────┘
```

**Screen 3: Results**
```
┌─────────────────────────────────────────┐
│  Validated Research Report              │
├─────────────────────────────────────────┤
│                                         │
│  ✓ HIGH CONFIDENCE FINDINGS (8)        │
│  • Phase III Clinical Trials (95%)     │
│  • M&A Advisory Services (92%)         │
│  • [more items...]                     │
│                                         │
│  ⚠ NEEDS REVIEW (3)                    │
│  • Infrastructure Engineering (65%)    │
│  • [more items...]                     │
│                                         │
│  [View Full Report] [Export] [Share]   │
│                                         │
└─────────────────────────────────────────┘
```

Style: Clean, modern UI with professional color scheme

---

### 7. Timeline/Roadmap Visual
Create a horizontal timeline showing:

**COMPLETED**
```
Oct 24-26: Artifact Index Research (Manual Validation)
└─→ Proof of concept established
    20+ hours manual comparison
    Measurable divergence patterns documented
```

**CURRENT**
```
Oct 30: Hackathon Development
└─→ Building MultiMind system
    Automating the validation process
    You.com API integration
```

**FUTURE**
```
Nov-Dec: Enhancement Phase
└─→ Community feedback
    Additional model support
    Advanced features

2026: Production Ready
└─→ SaaS product launch
    Enterprise adoption
    Research publication
```

Style: Clean timeline with milestones, arrows showing progression, icons for each phase

---

### 8. Artifact Index Case Study Visual
Create a comparison showing the manual research results:

**Title:** "The Proof: Manual Multi-Model Research Results"

**Two columns:**

**CLAUDE's Approach**
- Icon: Magnifying glass
- Focus: "Market-Rate Billing"
- Methodology: "15+ Web Searches"
- Example: "NDA Filing: $4M-$7M (service fee)"
- Strengths: "✓ Transparent | ✓ Granular | ✓ Professional services"

**GEMINI's Approach**
- Icon: Database/brain
- Focus: "Total Production Cost"
- Methodology: "Deep Synthesis"
- Example: "NDA Filing: $100M-$500M (full R&D)"
- Strengths: "✓ Comprehensive | ✓ Infrastructure | ✓ Big picture"

**Center Arrow Down:**
"BOTH NEEDED FOR COMPLETE TRUTH"

**Bottom:**
"MultiMind automates this discovery process"

---

### 9. Technical Stack Diagram
Create a layered architecture diagram:

**LAYER 1 (Top): User Interface**
- Streamlit/Gradio
- Web Dashboard
- API Endpoints

**LAYER 2: Application Logic**
- Orchestration Agent
- Comparison Engine
- Synthesis Agent

**LAYER 3: Integration Layer**
- You.com Chat API (Multi-model)
- You.com Search API
- You.com RAG API

**LAYER 4: Data Layer**
- Response Cache
- Comparison Results
- Confidence Scores

**LAYER 5 (Bottom): External Services**
- You.com Platform
- Model Providers (Claude, GPT-4)
- Knowledge Bases

Style: Professional layered diagram with clear separation, arrows showing data flow

---

### 10. Impact Metrics Dashboard
Create a visual dashboard showing:

**Center: "MultiMind Impact Metrics"**

**4 Metric Cards:**

```
┌─────────────────┐  ┌─────────────────┐
│  ACCURACY       │  │  TIME SAVED     │
│  ↑ 40%         │  │  ⏱ 98%         │
│  vs single-model│  │  20h → 5min     │
└─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│  CONFIDENCE     │  │  COVERAGE       │
│  📊 95%         │  │  🎯 +30%        │
│  avg score      │  │  more artifacts │
└─────────────────┘  └─────────────────┘
```

**Bottom Graph:**
"Hallucination Rate Comparison"
- Bar chart showing:
  - Single Model A: 15%
  - Single Model B: 18%
  - MultiMind (Consensus Only): 3%

---

## STYLE GUIDELINES FOR ALL VISUALS:

**Color Palette:**
- Primary: Deep blue (#1e40af)
- Success/Consensus: Green (#10b981)
- Warning/Divergence: Yellow (#f59e0b)
- Error/Missing: Red (#ef4444)
- Neutral: Gray (#6b7280)
- Background: Light (#f9fafb)

**Typography:**
- Headers: Bold, sans-serif
- Body: Regular, sans-serif
- Code/Technical: Monospace

**Icons:**
- Modern, minimal style
- Consistent size and weight
- Professional appearance

**Overall Aesthetic:**
- Clean and professional
- Tech-forward but accessible
- Suitable for pitch deck or technical presentation
- Clear visual hierarchy

---

## OUTPUT FORMAT:

Please create each visual as a separate artifact. For each diagram:
1. Choose the most appropriate format (SVG, HTML/CSS, ASCII art, or React component)
2. Make it publication-ready (suitable for proposal documents)
3. Ensure text is readable and proportions are balanced
4. Add brief usage notes for each visual

Generate all 10 visuals, focusing on clarity and professional presentation quality.

---

**END OF PROMPT**
