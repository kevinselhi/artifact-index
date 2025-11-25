# GitHub Actions Setup for You.com Batch Fetch

## Why GitHub Actions?

The You.com API may block requests from localhost but allows requests from GitHub's servers. This workflow runs the batch fetch on GitHub's infrastructure and automatically commits the results.

## Setup Steps

### 1. Add API Key as GitHub Secret

1. Go to your GitHub repository: https://github.com/kevinselhi/artifact-index
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Set:
   - **Name:** `YOU_API_KEY`
   - **Secret:** Your You.com API key (e.g., `ydc-sk-381ec4032cab99a5-gYFXaSSLFQL43U39SeTGPbkKD3MMq1B1-1efabc47`)
5. Click **Add secret**

### 2. Commit and Push the Workflow

```bash
git add .github/workflows/fetch-you-results.yml
git add GITHUB_ACTIONS_SETUP.md
git commit -m "Add GitHub Actions workflow for You.com batch fetch"
git push
```

### 3. Run the Workflow

1. Go to **Actions** tab in your GitHub repository
2. Click **Fetch You.com Search Results** in the left sidebar
3. Click **Run workflow** button (right side)
4. Configure options (or use defaults):
   - **Batch size:** 227 (all artifacts)
   - **Results per artifact:** 3
5. Click **Run workflow**

### 4. Monitor Progress

The workflow will:
1. ✅ Check out your repository
2. ✅ Set up Node.js environment
3. ✅ Run `fetch-you-results.js` with your API key
4. ✅ Upload results as workflow artifact
5. ✅ Commit `dashboard/data/you-search-results.json` to repository
6. ✅ Show summary of fetched results

Progress updates appear in real-time in the Actions tab.

### 5. Check Results

After workflow completes:
- **Committed file:** `dashboard/data/you-search-results.json` (automatically in your repo)
- **Download artifact:** Click on workflow run → **Artifacts** section → Download `you-search-results`

## How It Works

```
┌─────────────────────────────────────────┐
│   You (GitHub Actions Tab)             │
│   Click "Run workflow"                  │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│   GitHub Actions Runner                 │
│   (Ubuntu server in cloud)              │
│                                          │
│   1. Checkout code                      │
│   2. Setup Node.js                      │
│   3. Run fetch-you-results.js           │
│      with YOU_API_KEY from secrets      │
│   4. Commit results to repo             │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│   You.com API                           │
│   (Accepts requests from GitHub)        │
│                                          │
│   Returns 227 × 3 = 681 search results │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│   Your Repository                       │
│   dashboard/data/                       │
│     you-search-results.json             │
│                                          │
│   ✅ Automatically committed            │
│   ✅ GitHub Pages auto-deploys          │
└─────────────────────────────────────────┘
```

## Advantages Over Local Fetch

| Aspect | Local Fetch | GitHub Actions |
|--------|-------------|----------------|
| CORS Issues | ❌ Blocked by browser | ✅ No browser involved |
| Localhost Restrictions | ❌ API may block localhost | ✅ GitHub IPs trusted |
| API Key Security | ⚠️ In environment variable | ✅ Encrypted GitHub Secret |
| Automation | ❌ Manual process | ✅ One-click workflow |
| Results Deployment | ❌ Manual commit/push | ✅ Auto-committed |

## Workflow Inputs

You can customize the fetch when running:

- **batch_size:** How many artifacts to fetch (default: 227 = all)
  - Use smaller number for testing (e.g., 10)
  - Use 227 for full production run

- **results_per_artifact:** How many search results per artifact (default: 3)
  - Range: 1-10
  - More results = longer processing time

## Cost & Rate Limits

### GitHub Actions:
- ✅ Free for public repositories (unlimited minutes)
- ⏱️ Estimated runtime: 3-5 minutes for all 227 artifacts

### You.com API:
- 💰 Cost: ~$0.50-$2.00 (681 searches at 3 results each)
- ⏱️ Rate limits: Handled by 3-second delays between batches
- 💳 Your $60 credit balance: ~$58-59.50 remaining after run

## Troubleshooting

### Workflow Fails with "YOU_API_KEY not set"
- Check GitHub Secrets: Settings → Secrets → Actions
- Ensure secret name is exactly `YOU_API_KEY`

### Workflow Succeeds but No Results
- Check workflow logs for API errors
- Verify API key is valid
- Check if You.com API is accessible from GitHub

### Results Not Showing on GitHub Pages
- Wait 1-2 minutes for Pages to rebuild
- Check Actions tab for Pages deployment workflow
- Verify `you-search-results.json` was committed

## Next Steps After Successful Fetch

1. **Verify results:** Check `dashboard/data/you-search-results.json` in repository
2. **Update dashboard:** Integrate results into `dashboard/index.html` to replace MCP panel
3. **Deploy:** GitHub Pages will auto-deploy updated dashboard
4. **Refresh monthly:** Re-run workflow to keep results current

## Manual Trigger Schedule (Optional)

To automatically refresh results monthly, uncomment this in the workflow file:

```yaml
on:
  workflow_dispatch:  # Keep manual trigger
  schedule:
    - cron: '0 0 1 * *'  # Run 1st of each month at midnight UTC
```

## Files in This Setup

- `.github/workflows/fetch-you-results.yml` - GitHub Actions workflow definition
- `fetch-you-results.js` - Batch fetch script (already exists)
- `dashboard/data/you-search-results.json` - Output file (created by workflow)
- `GITHUB_ACTIONS_SETUP.md` - This documentation

## Security Notes

✅ **API key is secure:**
- Stored as encrypted GitHub Secret
- Never exposed in logs (masked automatically)
- Only accessible to workflow

✅ **Workflow permissions:**
- Read repository contents
- Write to repository (commit results)
- No other access granted

## Test Run Recommendation

Before processing all 227 artifacts, do a test run:

1. Run workflow with `batch_size: 10`
2. Check output in workflow logs
3. Verify `you-search-results.json` looks correct
4. If successful, run again with `batch_size: 227`

This saves API credits if there are any issues.
