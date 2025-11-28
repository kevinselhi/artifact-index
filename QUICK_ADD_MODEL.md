# Quick Reference: Adding a New Model

## TL;DR - 5 Steps

```bash
# 1. Get AI report and save to repo root
# (Do this manually - prompt the AI model yourself)

# 2. Extract data
node extract-model-data.js <report-file> <model-key>

# 3. Edit model metadata
# Add entry to dashboard/data/model_metadata.json with unique color

# 4. Merge into dashboard
node merge-model-data.js <model-key>

# 5. Deploy
git add .
git commit -m "Add <model-name> valuations"
git push origin main
```

## Example

```bash
# You prompted GPT-4.5 and saved response as gpt45_report.md

node extract-model-data.js gpt45_report.md gpt45

# Edit dashboard/data/model_metadata.json to add:
# {
#   "gpt45": {
#     "name": "GPT-4.5",
#     "color": "#ff6b6b",
#     "methodology": "Brief description"
#   }
# }

node merge-model-data.js gpt45

git add . && git commit -m "Add GPT-4.5 valuations" && git push
```

## Requirements

- `ANTHROPIC_API_KEY` environment variable (for extraction script)
- Node.js installed
- Report file saved in repository

## File Locations

- Reports: Save in repo root (e.g., `artifact_index_2020_<model>.md`)
- Extracted data: Auto-saved to `dashboard/data/extracted/<model-key>.json`
- Dashboard data: Auto-updated in `dashboard/data/master_valuations.json`
- Model info: Manually edit `dashboard/data/model_metadata.json`

## Available Colors

Already used (pick something different):
- Green: `#10b981` (Claude Opus 4.5)
- Blue: `#3b82f6` (Gemini 2.5)
- Orange: `#f97316` (Perplexity)
- Coral: `#ef4444` (Claude Sonnet 4.5)
- Teal: `#14b8a6` (ChatGPT 5-1)
- Cyan: `#06b6d4` (Gemini 3.0)
- Purple: `#a855f7` (o3pro)
- Red: `#dc2626` (ChatGPT 5)

Suggestions for next models:
- `#f59e0b` (amber)
- `#ec4899` (pink)
- `#8b5cf6` (violet)
- `#06b6d4` (sky)
- `#84cc16` (lime)

## Troubleshooting

**"Extracted data not found"**
→ Run extraction script first

**"ANTHROPIC_API_KEY not set"**
→ `export ANTHROPIC_API_KEY="sk-..."`

**Artifacts don't match**
→ Edit `dashboard/data/extracted/<model-key>.json` manually and re-run merge

**Dashboard not updating**
→ Clear browser cache, check GitHub Actions

For detailed instructions, see [ADD_NEW_MODEL.md](ADD_NEW_MODEL.md)
