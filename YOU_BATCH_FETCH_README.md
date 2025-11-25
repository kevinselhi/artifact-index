# You.com Batch Fetch Instructions

## Overview

We're replacing the MCP panel (which only works locally) with static You.com search results that will work on GitHub Pages for all users.

## What This Does

1. **Fetches AI/automation news** for all 227 artifacts
2. **Stores results in JSON** for static display
3. **Updates dashboard** to show search results instead of MCP panel

## How to Run

### Step 1: Set API Key

```bash
export YOU_API_KEY="your-you-com-api-key-here"
```

### Step 2: Test with 10 Artifacts (Recommended First)

```bash
node fetch-you-results-test.js
```

This will:
- Process first 10 artifacts only
- Take ~5 seconds
- Save results to `dashboard/data/you-search-results-test.json`
- Let you verify the API is working

### Step 3: Run Full Batch (227 Artifacts)

```bash
node fetch-you-results.js
```

This will:
- Process all 227 artifacts
- Batch in groups of 5
- Take ~2.5 minutes
- Save results to `dashboard/data/you-search-results.json`
- Show progress after each batch

**Cost estimate:** ~$0.50-$2.00 from your $60 credit balance

## Query Format

For each artifact, the script builds a query like:

```
{Artifact Name} {Sector} AI automation agents artificial intelligence proof of concept pilot 2024 2025
```

Examples:
- `Phase III Clinical Trial Medical/Pharma AI automation agents...`
- `M&A Advisory Financial Services AI automation agents...`
- `ERP Implementation Technology AI automation agents...`

## Output Format

Results are saved as JSON:

```json
{
  "artifacts": {
    "clinical_trial_phase3": {
      "id": "clinical_trial_phase3",
      "name": "Phase III Clinical Trial",
      "sector": "Medical/Pharma",
      "query": "Phase III Clinical Trial Medical/Pharma AI automation...",
      "results": [
        {
          "title": "AI in Clinical Trials: Latest Developments",
          "url": "https://example.com/article",
          "snippet": "Recent advances in AI for clinical trial automation...",
          "source": "example.com"
        }
      ],
      "fetchedAt": "2025-11-25T..."
    }
  },
  "metadata": {
    "totalArtifacts": 227,
    "processedArtifacts": 227,
    "lastUpdated": "2025-11-25T...",
    "resultsPerArtifact": 3,
    "apiProvider": "You.com Search API"
  }
}
```

## Next Steps After Fetch

Once results are fetched:

1. **Update dashboard UI** to replace MCP panel with search results
2. **Commit JSON file** to repository
3. **Deploy to GitHub Pages** - results will work for all users
4. **Optional:** Re-run monthly to keep results fresh

## Monitoring Progress

The script shows real-time progress:

```
=== Batch 1/46 ===
  Fetching: Phase III Clinical Trial...
  ✓ Phase III Clinical Trial: 3 results
  Fetching: New Drug Application...
  ✓ New Drug Application: 3 results
  ...
  Progress saved: 5/227 artifacts
  Waiting 3s before next batch...
```

## Error Handling

- Rate limits: 3-second delay between batches
- API errors: Logged but script continues
- Network errors: Retries are not automatic (re-run if needed)
- Progress is saved after each batch (safe to interrupt)

## Cost Breakdown

- **Test run (10 artifacts):** ~$0.02
- **Full run (227 artifacts):** ~$0.50-$2.00
- **Remaining after full run:** ~$58-$59.50 of $60

You can re-run this monthly to keep results fresh while staying well within your credit limit.
