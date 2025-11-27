# Report Generation Agent

A simple CLI tool for generating, parsing, and loading AI artifact valuation reports into the Artifact Index.

## Quick Start

```bash
# Show help
npm run agent -- help

# Parse an existing report to preview extracted data
npm run agent -- parse ./o3pro_HumanArtivactsReport_v4.md

# Load a report into master_valuations.json
npm run agent -- load ./GPT5_HumanArtifactsReport_v3.md --model-id chatgpt5
```

## Commands

### `parse` - Extract valuations from a markdown report

```bash
npm run agent -- parse <file-path>
```

Parses a markdown report and displays the extracted artifacts. Use this to verify parsing works before loading.

**Example:**
```bash
npm run agent -- parse ./o3pro_HumanArtivactsReport_v4.md
```

**Output:**
```
Parsed 100 artifacts:

Rank | Name | Sector | Value
-----|------|--------|------
1 | M&A advisory services | Management Consulting | $2,200,000
2 | Strategic transformation consulting | Management Consulting | $1,800,000
...
```

### `load` - Load a report into master_valuations.json

```bash
npm run agent -- load <file-path> --model-id <model-id>
```

Parses a report and adds/updates the valuations in `dashboard/data/master_valuations.json`.

**Example:**
```bash
npm run agent -- load ./new_model_report.md --model-id my_new_model
```

**What it does:**
- Parses the markdown report
- For each artifact found:
  - If it exists in master_valuations.json → adds the new model's valuation
  - If it's new → creates a new artifact entry
- Recalculates variance ratios automatically

### `generate` - Generate a new report via API

```bash
npm run agent -- generate --model <model-key>
```

Calls an AI model API to generate a new artifact valuation report.

**Available models:**
- `claude_sonnet45` - Claude Sonnet 4.5 (requires `ANTHROPIC_API_KEY`)
- `claude_opus45` - Claude Opus 4.5 (requires `ANTHROPIC_API_KEY`)
- `chatgpt5` - GPT-4o (requires `OPENAI_API_KEY`)
- `gemini` - Gemini 2.5 Pro (requires `GOOGLE_API_KEY`)

**Example:**
```bash
export ANTHROPIC_API_KEY=sk-ant-...
npm run agent -- generate --model claude_sonnet45
```

The generated report is saved to `./reports/<model>_report_<timestamp>.md`.

### `list-models` - Show available model configurations

```bash
npm run agent -- list-models
```

### `prompt` - Print the system prompt template

```bash
npm run agent -- prompt
```

Useful for copying the prompt to use manually in other AI interfaces.

## Supported Report Formats

The parser handles various markdown table formats:

### Standard format
```markdown
| Rank | Artifact Name | Sector | Typical Value (USD) |
|------|---------------|--------|---------------------|
| 1    | M&A Advisory  | Finance| $5,000,000          |
```

### Thousands format (USD K)
```markdown
| # | Deliverable | Sector | Typical 2020 Value (USD K) |
|---|-------------|--------|---------------------------|
| 1 | M&A Advisory | Finance | 5 000 |
```

### With extra columns
```markdown
| Rank | Name | Sector | Value | Producer Type | Automation Score |
```

## Workflow: Adding a New Model

1. **Get the report** - Either generate via API or obtain manually from the AI interface

2. **Save the report** - Save as markdown in the repository root or `./reports/`

3. **Preview parsing**:
   ```bash
   npm run agent -- parse ./new_report.md
   ```

4. **Load into master data**:
   ```bash
   npm run agent -- load ./new_report.md --model-id new_model_name
   ```

5. **Verify** - Check `dashboard/data/master_valuations.json` for the new valuations

## Environment Variables

| Variable | Required For |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Claude models |
| `OPENAI_API_KEY` | GPT models |
| `GOOGLE_API_KEY` | Gemini models |

## Files

- `report-generation-agent.ts` - The agent source code
- `dashboard/data/master_valuations.json` - Master valuations database
- `dashboard/data/model_metadata.json` - Model metadata for the dashboard
- `TopArtifiact_System Prompt_v2.md` - Original detailed prompt template
