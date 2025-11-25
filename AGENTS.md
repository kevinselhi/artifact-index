# Repository Guidelines

## Project Structure & Module Organization
- Core deliverables sit at the repo root as Markdown reports (e.g., `2020_Human_Artifact_Index_Claude_Research.md`, `Comparative_Analysis_Claude_vs_Gemini_2020_Artifact_Index.md`, `Data_Visualizations_Report.md`) alongside supporting narratives (`HACKATHON_PROPOSAL.md`, `TECHNICAL_INTEGRATION_GUIDE.md`).
- Source data lives beside the reports: CSV exports (`artifact_data_export.csv`, `baseline_data_enriched.csv`, `100_artifact_taxonomy_perplexity_11222025.csv`) and structured JSON (`visualizations_data.json`).
- Keep any new research prompts or guidance in Markdown at the root; place generated visuals in a `visuals/` folder if added. Reserve `a2agents.com/` for future site assets and leave `.claude/` as-is for tool settings.

## Build, Test, and Development Commands
- No build pipeline is required; documents are ready-to-read Markdown and data files.
- Validate JSON structure when editing: `python -m json.tool visualizations_data.json`.
- Spot-check CSV integrity after edits (row counts, required columns):
```bash
python - <<'PY'
import pandas as pd
df = pd.read_csv("artifact_data_export.csv")
print(df.shape, df.columns.tolist())
PY
```
- Use `rg` for quick searches across narratives and data labels: `rg "clinical trial"`.

## Coding Style & Naming Conventions
- Write in Markdown with clear `#`/`##` headings, short bullet lists, and fenced code blocks for commands.
- File names should stay snake_case with context-first wording and dates when relevant (pattern: `topic_scope_year.ext`).
- Keep tables ASCII-friendly; avoid embedded rich media in Markdown files—link or place assets under `visuals/`.

## Testing Guidelines
- No automated tests exist. Validate changes by re-reading affected sections, confirming data tallies, and keeping figure counts consistent across reports and CSV/JSON sources.
- When adding datasets, include a short companion note in the same commit summarizing provenance, column meanings, and row counts.

## Commit & Pull Request Guidelines
- This working copy has no Git history; if you initialize Git, prefer conventional commits (`feat: add clinical-trial deltas`, `docs: update comparative analysis`).
- Keep changes logically grouped (one thematic update per commit). For PRs, include: purpose/impact summary, key files touched, manual validation notes (e.g., CSV row count checks), and links to any referenced research prompts or visuals.
- Attach screenshots or snippets only when adjusting visual assets or tabular layouts to show before/after clarity.
