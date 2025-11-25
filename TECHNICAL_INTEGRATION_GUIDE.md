# Technical Integration Guide
## Adding 2020 Baseline to Your Pipeline

**For:** Pipeline team
**Purpose:** Quick integration reference
**Time:** 2-3 hours implementation

---

## 🎯 What You're Adding

Your current pipeline:
```
Search → Contents → Valuation → PDF
```

Enhanced pipeline:
```
Baseline Lookup → Search (enhanced) → Contents (4-field) → Disruption Analysis → PDF (enriched)
```

---

## Step 1: Load Baseline Data (30 minutes)

### Option A: Simple CSV Loader

```python
import pandas as pd

class BaselineData:
    def __init__(self, csv_path='artifact_data_export.csv'):
        self.df = pd.read_csv(csv_path)
        self.artifacts = self._build_index()

    def _build_index(self):
        """Create fast lookup dict"""
        index = {}
        for _, row in self.df.iterrows():
            index[row['Artifact'].lower()] = {
                'name': row['Artifact'],
                'claude_value': row['Claude Value Range'],
                'gemini_value': row['Gemini Value Range'],
                'sector': row['Sector'],
                'covid_impact': row.get('COVID Impact', 'Unknown'),
                'description': row.get('Description', '')
            }
        return index

    def get_artifact(self, name):
        """Fuzzy match artifact name"""
        name_lower = name.lower()

        # Exact match
        if name_lower in self.artifacts:
            return self.artifacts[name_lower]

        # Partial match
        for key, value in self.artifacts.items():
            if name_lower in key or key in name_lower:
                return value

        return None

# Usage
baseline = BaselineData()
artifact_2020 = baseline.get_artifact("M&A Due Diligence")
# Returns: {
#     'name': 'M&A Advisory Package',
#     'claude_value': '$4M-$8M',
#     'gemini_value': '$7M',
#     'sector': 'Financial Services',
#     'covid_impact': 'Decreased in Q2 2020, rebounded Q3-Q4',
#     'description': '...'
# }
```

### Option B: JSON Lookup (if CSV doesn't exist)

```python
# Use Kevin's visualizations_data.json instead
import json

class BaselineData:
    def __init__(self, json_path='visualizations_data.json'):
        with open(json_path, 'r') as f:
            data = json.load(f)

        # Extract artifact lists
        self.claude_top_10 = data.get('claude_top_10', [])
        self.gemini_top_10 = data.get('gemini_top_10', [])
        self.artifacts = self._merge_sources()

    def _merge_sources(self):
        """Combine Claude and Gemini data"""
        index = {}

        for item in self.claude_top_10:
            key = item['artifact'].lower()
            index[key] = {
                'name': item['artifact'],
                'claude_value': item['value'],
                'sector': item.get('sector', 'Unknown')
            }

        for item in self.gemini_top_10:
            key = item['artifact'].lower()
            if key in index:
                index[key]['gemini_value'] = item['value']
            else:
                index[key] = {
                    'name': item['artifact'],
                    'gemini_value': item['value'],
                    'sector': item.get('sector', 'Unknown')
                }

        return index
```

---

## Step 2: Enhance Search Queries (30 minutes)

### Current Search (your pipeline)
```python
def search_artifact(artifact_name):
    query = f"{artifact_name} professional services"
    results = you_search(query)
    return results
```

### Enhanced Search (disruption-focused)
```python
def search_artifact_with_disruption(artifact_name, baseline_data):
    """Enhanced search with 2020 baseline context"""

    # Get 2020 context
    baseline = baseline_data.get_artifact(artifact_name)
    sector = baseline['sector'] if baseline else 'professional services'

    # Multi-query strategy
    queries = [
        # Current state
        f"2024 market rate {artifact_name}",
        f"{artifact_name} pricing trends 2023 2024",

        # AI disruption
        f"AI tools replacing {artifact_name}",
        f"AI automation {sector} {artifact_name}",
        f"{artifact_name} AI adoption rate 2024",

        # Market changes
        f"{artifact_name} demand changes since 2020",
        f"how AI changed {artifact_name}"
    ]

    results = []
    for query in queries[:4]:  # Limit to avoid rate limits
        search_results = you_search(query)
        results.extend(search_results)

    return {
        'baseline': baseline,
        'current_research': results,
        'search_queries': queries
    }
```

---

## Step 3: Enhance Content Agent Prompts (2-3 hours)

### Current Prompt (your system)
```python
prompt = f"Generate description for {artifact_name}"
```

### Enhanced 4-Field Prompt (disruption analysis)

```python
def generate_4_field_profile(artifact_name, baseline, research_results):
    """Generate McKinsey-grade 4-field artifact profile"""

    # Prepare context
    baseline_value = baseline['claude_value'] if baseline else 'Unknown'
    sector = baseline['sector'] if baseline else 'Unknown'
    covid_notes = baseline.get('covid_impact', '') if baseline else ''

    # Build research summary
    research_summary = "\n".join([
        f"- {r['title']}: {r['snippet']}"
        for r in research_results[:10]
    ])

    prompt = f"""You are a McKinsey consultant writing an artifact profile for "The AI Disruption Impact Index 2024".

ARTIFACT: {artifact_name}

2020 BASELINE DATA:
- Sector: {sector}
- 2020 Value: {baseline_value}
- COVID-19 Impact: {covid_notes}

2024 RESEARCH FINDINGS:
{research_summary}

Generate a 4-field analysis following this EXACT structure:

1. DESCRIPTION (2-3 sentences)
   - What this artifact is and what it contains
   - Its role in professional workflows
   - Technical/domain complexity level

2. PRODUCER TEAMS (2-3 sentences)
   - Who created this in 2020 (firm types, team sizes, roles)
   - Required expertise and typical timeline
   - How AI has changed production teams/process (if identified in research)

3. CLIENT CONTEXT (2-3 sentences)
   - Who commissioned this artifact and why
   - Business problems it solved
   - Available alternatives then vs. now

4. 2020→2024 TRANSFORMATION (4-5 sentences)
   - 2020 baseline: [value], [COVID impact if any]
   - 2024 current state: [what research shows]
   - AI disruption: [specific tools/platforms identified]
   - Value/time changes: [quantify if possible]
   - Strategic significance: [what this means for the industry]

EXAMPLE (for reference):
[Include 1-2 high-quality examples here]

REQUIREMENTS:
- Be specific: Use numbers, percentages, tool names from research
- Be evidence-based: Cite what's in 2024 research vs. baseline data
- Be insightful: Explain WHY changes happened, not just WHAT changed
- Use professional tone: McKinsey/BCG quality

OUTPUT: Return ONLY the 4 field labels and content, no preamble.
"""

    # Call You.com Chat API
    response = you_chat(
        prompt,
        model='gpt-4o',  # or 'claude-3-5-sonnet'
        temperature=0.3  # Lower temp for factual accuracy
    )

    return parse_4_field_response(response)

def parse_4_field_response(response_text):
    """Extract structured fields from response"""
    fields = {
        'description': extract_section(response_text, 'DESCRIPTION'),
        'producers': extract_section(response_text, 'PRODUCER TEAMS'),
        'clients': extract_section(response_text, 'CLIENT CONTEXT'),
        'transformation': extract_section(response_text, '2020→2024 TRANSFORMATION')
    }
    return fields

def extract_section(text, header):
    """Extract content between section headers"""
    import re
    pattern = f"{header}.*?\\n(.*?)(?=\\n\\n[A-Z]|$)"
    match = re.search(pattern, text, re.DOTALL)
    return match.group(1).strip() if match else ''
```

---

## Step 4: Add Disruption Calculation (1 hour)

```python
class DisruptionAnalyzer:
    """Calculate AI disruption metrics"""

    def analyze(self, artifact_name, baseline, current_profile):
        """
        Calculate disruption score and value migration

        Returns:
            {
                'disruption_score': 0-100,
                'value_change_pct': float,
                'ai_tools': [list],
                'category': 'High' | 'Medium' | 'Low' | 'Enhanced'
            }
        """

        # Extract current value from profile
        current_value = self._extract_value(current_profile['transformation'])
        baseline_value = self._parse_value(baseline['claude_value'])

        # Calculate value change
        if baseline_value and current_value:
            value_change = ((current_value - baseline_value) / baseline_value) * 100
        else:
            value_change = None

        # Identify AI tools mentioned
        ai_tools = self._extract_ai_tools(current_profile['transformation'])

        # Calculate disruption score
        score = self._calculate_score(value_change, ai_tools, current_profile)

        # Categorize
        if score >= 60:
            category = 'High Disruption (>60%)'
        elif score >= 30:
            category = 'Medium Disruption (30-60%)'
        elif score > 0:
            category = 'Low Disruption (<30%)'
        else:
            category = 'Enhanced by AI'

        return {
            'disruption_score': score,
            'value_change_pct': value_change,
            'ai_tools': ai_tools,
            'category': category,
            'baseline_value': baseline_value,
            'current_value': current_value
        }

    def _parse_value(self, value_string):
        """Parse '$500K-$1.5M' → 950000 (midpoint)"""
        import re

        # Extract numbers
        numbers = re.findall(r'[\d.]+', value_string)
        if not numbers:
            return None

        # Parse first number
        num = float(numbers[0])

        # Handle K/M/B multipliers
        if 'M' in value_string.upper():
            num *= 1_000_000
        elif 'K' in value_string.upper():
            num *= 1_000
        elif 'B' in value_string.upper():
            num *= 1_000_000_000

        # If range, get midpoint
        if len(numbers) > 1:
            num2 = float(numbers[1])
            if 'M' in value_string.upper():
                num2 *= 1_000_000
            elif 'K' in value_string.upper():
                num2 *= 1_000
            num = (num + num2) / 2

        return num

    def _extract_ai_tools(self, transformation_text):
        """Extract AI tool names from text"""
        ai_tools = []

        # Common AI tools to look for
        known_tools = [
            'Harvey', 'ChatGPT', 'Claude', 'Gemini', 'GPT-4', 'Copilot',
            'Luminance', 'Kira', 'Casetext', 'Lex Machina',
            'Jasper', 'Copy.ai', 'Grammarly',
            'Tableau', 'Power BI', 'DataRobot',
            'GitHub Copilot', 'Tabnine', 'Replit',
            'Midjourney', 'DALL-E', 'Stable Diffusion'
        ]

        text_lower = transformation_text.lower()
        for tool in known_tools:
            if tool.lower() in text_lower:
                ai_tools.append(tool)

        return list(set(ai_tools))  # Deduplicate

    def _calculate_score(self, value_change, ai_tools, profile):
        """Calculate 0-100 disruption score"""
        score = 0

        # Value change component (50 points max)
        if value_change is not None:
            if value_change < -60:
                score += 50  # High disruption
            elif value_change < -30:
                score += 35
            elif value_change < 0:
                score += 20
            else:
                score += 0  # No value disruption

        # AI tool adoption component (30 points max)
        tool_count = len(ai_tools)
        if tool_count >= 3:
            score += 30
        elif tool_count == 2:
            score += 20
        elif tool_count == 1:
            score += 10

        # Transformation narrative depth (20 points max)
        transformation_text = profile.get('transformation', '')
        if 'automation' in transformation_text.lower():
            score += 5
        if any(word in transformation_text.lower() for word in ['reduced', 'decreased', 'replaced']):
            score += 5
        if re.search(r'\d+%', transformation_text):  # Has percentages
            score += 5
        if len(transformation_text) > 500:  # Detailed analysis
            score += 5

        return min(score, 100)
```

---

## Step 5: Enhance PDF Output (1 hour)

```python
def generate_disruption_pdf(artifacts_with_analysis):
    """Generate enhanced PDF with disruption insights"""

    # Sort by disruption score
    sorted_artifacts = sorted(
        artifacts_with_analysis,
        key=lambda x: x['disruption']['disruption_score'],
        reverse=True
    )

    # Group by disruption category
    categories = {
        'High Disruption (>60%)': [],
        'Medium Disruption (30-60%)': [],
        'Low Disruption (<30%)': [],
        'Enhanced by AI': []
    }

    for artifact in sorted_artifacts:
        category = artifact['disruption']['category']
        categories[category].append(artifact)

    # Generate executive summary
    exec_summary = generate_executive_summary(sorted_artifacts, categories)

    # Build PDF sections
    pdf_content = {
        'title': 'The AI Disruption Impact Index 2024',
        'subtitle': 'How AI Transformed Professional Services (2020-2024)',
        'executive_summary': exec_summary,
        'methodology': generate_methodology_section(),
        'disruption_heatmap': generate_heatmap_data(categories),
        'top_25_disrupted': sorted_artifacts[:25],
        'detailed_profiles': generate_detailed_profiles(sorted_artifacts),
        'appendix': generate_appendix()
    }

    return create_pdf(pdf_content)

def generate_executive_summary(artifacts, categories):
    """Use You.com Chat to synthesize executive summary"""

    # Prepare data summary
    total_artifacts = len(artifacts)
    high_disruption = len(categories['High Disruption (>60%)'])
    medium_disruption = len(categories['Medium Disruption (30-60%)'])
    low_disruption = len(categories['Low Disruption (<30%)'])
    enhanced = len(categories['Enhanced by AI'])

    # Get top AI tools
    all_tools = []
    for artifact in artifacts:
        all_tools.extend(artifact['disruption']['ai_tools'])
    tool_counts = Counter(all_tools)
    top_tools = tool_counts.most_common(5)

    # Calculate total value migration
    total_migration = sum([
        artifact['disruption'].get('value_change_pct', 0)
        for artifact in artifacts
    ]) / total_artifacts if artifacts else 0

    prompt = f"""Generate an executive summary for "The AI Disruption Impact Index 2024" report.

DATA SUMMARY:
- Total artifacts analyzed: {total_artifacts}
- High disruption (>60%): {high_disruption} artifacts
- Medium disruption (30-60%): {medium_disruption} artifacts
- Low disruption (<30%): {low_disruption} artifacts
- Enhanced by AI: {enhanced} artifacts
- Average value change: {total_migration:.1f}%
- Top AI tools: {', '.join([f'{tool} ({count})' for tool, count in top_tools])}

TOP 5 MOST DISRUPTED ARTIFACTS:
{chr(10).join([f"{i+1}. {a['name']} ({a['disruption']['disruption_score']:.0f}% disruption, {a['disruption']['value_change_pct']:+.0f}% value change)" for i, a in enumerate(artifacts[:5])])}

WRITE:
1. Opening paragraph (2-3 sentences) setting context
2. Key patterns section (3-4 bullet points with specific examples and numbers)
3. Value distribution insight (2-3 sentences on where value went)
4. Bold key finding (1 powerful sentence summarizing the transformation)

Style: McKinsey report, bold but evidence-based, specific numbers and examples.
"""

    summary = you_chat(prompt, model='gpt-4o', temperature=0.4)
    return summary
```

---

## Step 6: Integration Checklist

### Modified Files in Your Pipeline:

```
your-pipeline/
├── src/
│   ├── baseline_loader.py         [NEW] - Load Kevin's data
│   ├── search_agent.py             [MODIFIED] - Enhanced queries
│   ├── contents_agent.py           [MODIFIED] - 4-field prompts
│   ├── disruption_analyzer.py      [NEW] - Calculate disruption
│   ├── synthesis_agent.py          [NEW] - Executive summary
│   └── pdf_generator.py            [MODIFIED] - Enhanced template
│
├── data/
│   ├── artifact_data_export.csv    [FROM KEVIN]
│   └── visualizations_data.json    [FROM KEVIN]
│
└── examples/
    └── 4_field_examples.json       [NEW] - High-quality examples for prompts
```

### Test Sequence:

1. **Unit Test - Baseline Loader**
```python
baseline = BaselineData('data/artifact_data_export.csv')
artifact = baseline.get_artifact('M&A Due Diligence')
assert artifact is not None
assert 'claude_value' in artifact
print("✓ Baseline loader working")
```

2. **Integration Test - Single Artifact**
```python
# Run full pipeline on one artifact
result = process_artifact_with_disruption('M&A Advisory Package')
assert len(result['profile']) == 4  # 4 fields
assert result['disruption']['disruption_score'] > 0
print("✓ Single artifact pipeline working")
```

3. **Full Test - 5 Artifacts**
```python
test_artifacts = [
    'M&A Advisory Package',
    'Contract Review',
    'Financial Audit',
    'Marketing Campaign',
    'Software Architecture'
]
results = [process_artifact_with_disruption(a) for a in test_artifacts]
assert all(r['disruption'] for r in results)
print(f"✓ Generated {len(results)} complete profiles")
```

4. **Quality Check - Manual Review**
```python
# Print one profile for manual QA
print_formatted_profile(results[0])
# Manual check:
# [ ] Description is clear and specific
# [ ] Producers mentions 2020 vs 2024 changes
# [ ] Clients explains why needed
# [ ] Transformation has numbers and AI tools
```

---

## Quick Reference: What Kevin Provides

### Files You Need:
1. `artifact_data_export.csv` - 60+ artifacts with valuations
2. `visualizations_data.json` - Top 10 lists from both models
3. `4_field_examples.json` - 2-3 high-quality example profiles for prompts

### Data Format (CSV):
```
Artifact,Sector,Claude Value Range,Gemini Value Range,COVID Impact,Description
"M&A Advisory Package","Financial Services","$4M-$8M","$7M","Decreased Q2, rebounded Q3-Q4","..."
```

### What to Ask Kevin For:
- [ ] artifact_data_export.csv file
- [ ] 2-3 fully written example profiles (for prompt engineering)
- [ ] List of top 25 artifacts to prioritize (if you want to limit scope)

---

## Estimated Time Breakdown

| Task | Time | Priority |
|------|------|----------|
| Step 1: Baseline loader | 30 min | P0 (required) |
| Step 2: Enhanced search | 30 min | P0 (required) |
| Step 3: 4-field prompts | 2-3 hours | P0 (required) |
| Step 4: Disruption analyzer | 1 hour | P1 (nice to have) |
| Step 5: PDF enhancements | 1 hour | P1 (nice to have) |
| Step 6: Testing & QA | 1-2 hours | P0 (required) |

**Total:** 6-9 hours (parallelizable across team)

**MVP:** Steps 1-3 + basic testing = working demo
**Stretch:** Steps 4-5 = first-place quality

---

## Emergency Shortcuts (If Time Runs Out)

### Shortcut 1: Hardcode Examples
Instead of perfect prompts, hardcode 2-3 perfect artifact profiles and generate the rest with simpler prompts.

### Shortcut 2: Skip Disruption Calculation
Focus on narrative quality. Let the synthesis agent infer disruption from 4-field content.

### Shortcut 3: Simple PDF
Skip fancy formatting. Export markdown that looks good when converted to PDF.

### Shortcut 4: Reduce Scope
Do 10-15 artifacts excellently instead of 25 adequately.

---

## Support from Kevin's Team

**Available for:**
- Data formatting questions
- Example profile writing
- Prompt engineering review
- QA on narrative quality

**Slack channel:** [TBD]
**Check-in schedule:** Every 4 hours

---

**Quick Start:** Begin with Step 1 (baseline loader) while waiting for Kevin's data files. Test with dummy data first.
