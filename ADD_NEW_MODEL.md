# Adding a New AI Model to the Dashboard

This guide explains how to add valuations from a new AI model to the AI Opportunity Index dashboard.

## Overview

**Manual Steps (You):**
1. Prompt the AI model with the research template
2. Save the model's response to the repository
3. Run the extraction script

**Automated Steps (Scripts):**
1. Parse the report to extract artifact valuations
2. Update dashboard data files
3. Rebuild dashboard with new model

---

## Step 1: Get the AI Model Report

### 1.1 Use the Research Prompt Template

Copy the research prompt from `TopArtifiact_System Prompt_v2.md` and submit it to your chosen AI model.

**Recommended settings:**
- Enable "Deep Research" or "Extended Thinking" if available
- Request a structured output with clear valuations
- Ask for reasoning/methodology explanation

### 1.2 Save the Model's Response

Save the complete response to the repository root:

**Naming convention:**
- **Markdown format:** `artifact_index_2020_[model_name].md`
- **PDF format:** `artifact_index_2020_[model_name].pdf`
- **Text format:** `artifact_index_2020_[model_name].txt`

**Examples:**
- `artifact_index_2020_claude_opus_45.md`
- `artifact_index_2020_gpt5_deep_research.pdf`
- `artifact_index_2020_gemini_30_pro.txt`

### 1.3 Expected Report Structure

The model's report should ideally include:
- **Ranked list of artifacts** (top 10-100)
- **Valuation amounts** for each artifact (in USD)
- **Methodology explanation** (how valuations were determined)
- **Sector/category** for each artifact
- **Source citations** (optional but helpful)

---

## Step 2: Extract Data from the Report

### 2.1 Run the Extraction Script

```bash
node extract-model-data.js [report-file] [model-key]
```

**Parameters:**
- `[report-file]`: Path to the report file you saved
- `[model-key]`: Short identifier for the model (e.g., `claude_opus45`, `gpt5`, `gemini30`)

**Example:**
```bash
node extract-model-data.js artifact_index_2020_claude_opus_45.md claude_opus45
```

### 2.2 What the Script Does

The extraction script will:
1. **Parse the report** using Claude to extract valuations
2. **Match artifacts** to existing entries in master_valuations.json
3. **Create a data file** at `dashboard/data/extracted/[model-key].json`
4. **Display a preview** of extracted data for your review

### 2.3 Review the Extracted Data

Check `dashboard/data/extracted/[model-key].json` to verify:
- Artifact names match existing entries
- Valuations are in correct format (numbers, not strings)
- All expected artifacts were extracted

**If corrections are needed:**
- Edit the JSON file directly
- Re-run the merge script (next step)

---

## Step 3: Add Model Metadata

Before merging, add the model's metadata to `dashboard/data/model_metadata.json`:

```json
{
  "models": {
    "your_model_key": {
      "name": "Model Display Name",
      "color": "#hexcolor",
      "methodology": "Brief description of how this model approaches valuations",
      "strengths": "What this model does well",
      "topArtifact": "Name of highest valued artifact",
      "topValue": 0000000,
      "coverageScore": 0,
      "uniquenessScore": 0,
      "deviationScore": 0
    }
  }
}
```

**Choose a unique color** that's visually distinct from existing models:
- Claude Opus 4.5: `#10b981` (green)
- Gemini 2.5 Pro: `#3b82f6` (blue)
- Perplexity: `#f97316` (orange)
- Claude Sonnet 4.5: `#ef4444` (coral)
- ChatGPT 5-1: `#14b8a6` (teal)
- Gemini 3.0 Pro: `#06b6d4` (cyan)
- o3pro: `#a855f7` (purple)
- ChatGPT 5: `#dc2626` (red)

**Note:** Coverage, uniqueness, and deviation scores will be calculated automatically when you run the merge script.

---

## Step 4: Merge Data into Dashboard

### 4.1 Run the Merge Script

```bash
node merge-model-data.js [model-key]
```

**Example:**
```bash
node merge-model-data.js claude_opus45
```

### 4.2 What the Merge Script Does

1. **Loads extracted data** from `dashboard/data/extracted/[model-key].json`
2. **Merges valuations** into `dashboard/data/master_valuations.json`
3. **Recalculates variance ratios** across all models
4. **Updates model metadata** with calculated scores
5. **Creates a backup** of previous data
6. **Validates the updated data** for consistency

### 4.3 Review the Changes

The script will output:
- Number of artifacts updated
- New variance ratios calculated
- Coverage score (% of artifacts with valuations)
- Uniqueness score (% with distinctive perspective)
- Deviation score (alignment with consensus)

---

## Step 5: Test the Dashboard

### 5.1 View Locally

```bash
open dashboard/index.html
```

Or serve via HTTP:
```bash
python3 -m http.server 8000
# Then visit http://localhost:8000/dashboard/index.html
```

### 5.2 Verify the Integration

Check that:
- New model appears in Model Comparison tab
- Valuations display correctly in charts
- Color coding is distinct and readable
- Variance analysis includes new model
- Top artifacts list updates properly

---

## Step 6: Commit and Deploy

### 6.1 Commit Changes

```bash
git add .
git commit -m "Add [Model Name] valuations to dashboard"
git push origin main
```

### 6.2 GitHub Pages Deployment

The dashboard will automatically update on GitHub Pages within 1-2 minutes.

**Live URL:** https://kevinselhi.github.io/artifact-index/dashboard/index.html

---

## Troubleshooting

### Extraction Failed
**Problem:** Script couldn't parse the report
**Solution:**
- Check report formatting (clear artifact names and values)
- Try a different file format (PDF → Markdown conversion)
- Manually create the extracted JSON file

### Artifacts Don't Match
**Problem:** New model uses different artifact names
**Solution:**
- Check `artifact_id_mapping.json` for name variations
- Add new aliases to the mapping file
- Re-run extraction script

### Dashboard Not Updating
**Problem:** Changes don't appear on live site
**Solution:**
- Clear browser cache
- Check GitHub Actions for build errors
- Verify files committed to `main` branch
- Wait 2-3 minutes for deployment

### Valuations Look Wrong
**Problem:** Numbers seem too high/low or incorrectly parsed
**Solution:**
- Check extracted JSON file directly
- Look for unit confusion ($1M vs $1,000,000)
- Verify methodology matches existing models
- Edit JSON manually if needed

---

## Data File Reference

### Key Files

| File | Purpose |
|------|---------|
| `dashboard/data/master_valuations.json` | Main data source with all model valuations |
| `dashboard/data/model_metadata.json` | Model characteristics and display settings |
| `dashboard/data/extracted/[model].json` | Temporary extraction output |
| `artifact_id_mapping.json` | Name variations and aliases |
| `TopArtifiact_System Prompt_v2.md` | Original research prompt |

### Data Structure

**master_valuations.json:**
```json
{
  "artifacts": [
    {
      "id": "unique_artifact_id",
      "name": "Display Name",
      "sector": "Industry Sector",
      "valuations": {
        "model_key_1": 1000000,
        "model_key_2": null,
        "your_new_model": 1500000
      },
      "variance_ratio": 2.5
    }
  ]
}
```

**model_metadata.json:**
```json
{
  "models": {
    "your_model_key": {
      "name": "Display Name",
      "color": "#hexcolor",
      "methodology": "Description",
      "coverageScore": 85,
      "uniquenessScore": 23,
      "deviationScore": 12
    }
  }
}
```

---

## Advanced: Manual Data Entry

If extraction fails, you can manually add data:

### 1. Create JSON File

```json
{
  "model_key": "your_model_name",
  "artifacts": [
    {
      "name": "Phase III Clinical Trial",
      "value": 22500000,
      "sector": "Medical/Pharma"
    },
    {
      "name": "New Drug Application",
      "value": 5500000,
      "sector": "Medical/Pharma"
    }
  ]
}
```

### 2. Match to Existing IDs

Cross-reference artifact names with `master_valuations.json` to find correct IDs.

### 3. Add Valuations Directly

Edit `dashboard/data/master_valuations.json` and add your model's values to the `valuations` object.

### 4. Recalculate Variance

Run: `node recalculate-variance.js`

---

## Questions or Issues?

- Check existing model reports for format examples
- Review `7_model_comparison_analysis.md` for methodology context
- Open a GitHub issue for technical problems
- See `CLAUDE.md` for project architecture details

---

**Last Updated:** November 2025
