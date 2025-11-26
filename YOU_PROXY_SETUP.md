# You.com API Proxy Setup

## Problem
The You.com API doesn't allow direct browser requests due to CORS (Cross-Origin Resource Sharing) restrictions. Browsers get "Failed to fetch" errors when trying to call the API directly.

## Solution
Use a local proxy server that routes requests from the browser to You.com API, adding proper CORS headers.

## Setup Steps

### 1. Set Your API Key
```bash
export YOU_API_KEY="ydc-sk-6328c79732b3d087-dkI9ryBUYn1gqne4FrD6okjESR1i8c0v-3cc2c76f__1SNQG8ETU8N2v5f4HwgDYJZN"
```

### 2. Start the Proxy Server
```bash
node you-proxy-server.js
```

You should see:
```
============================================================
You.com API Proxy Server
============================================================
Running on: http://localhost:8081
API Key: ydc-sk-632...YJZN
```

### 3. Open the Fetch Page
In another terminal:
```bash
# Keep Python server running (port 8080)
python3 -m http.server 8080 --directory dashboard
```

Then open: http://localhost:8080/fetch-you-manual.html

### 4. Start Fetching
- Click **"Fetch Next Artifact"** to test one artifact
- If successful, click **"Auto-Fetch All"** to process all 227 artifacts
- Click **"Download Progress"** anytime to save results as JSON

## How It Works

### Without Proxy (Fails):
```
Browser → You.com API (❌ CORS blocked)
```

### With Proxy (Works):
```
Browser → Proxy Server (localhost:8081) → You.com API (✅ Success)
```

The proxy server:
1. Receives requests from browser at `http://localhost:8081/search`
2. Forwards them to You.com with your API key
3. Returns results with proper CORS headers

## Testing the Proxy

Test with curl:
```bash
curl "http://localhost:8081/search?query=AI%20automation&count=3"
```

Or test in browser console:
```javascript
fetch('http://localhost:8081/search?query=AI%20automation&count=3')
  .then(r => r.json())
  .then(data => console.log(data));
```

## Troubleshooting

### Proxy Not Running
If you see "Failed to fetch" in the manual fetch page:
1. Check proxy server is running in another terminal
2. Look for "Running on: http://localhost:8081" message
3. Make sure YOU_API_KEY is set

### API Key Issues
If proxy shows "403 Forbidden" or "401 Unauthorized":
- API key may be expired or invalid
- Try requesting a new key from You.com

### Port Conflicts
If port 8081 is already in use:
1. Edit `you-proxy-server.js` and change `const PORT = 8081`
2. Edit `dashboard/fetch-you-manual.html` and change `http://localhost:8081` to match

## Output Files

Successful fetches save to:
- **LocalStorage:** Browser saves progress automatically
- **JSON Download:** Click "Download Progress" button
  - Saves as: `you-search-results-YYYY-MM-DD.json`
  - Location: Your browser's default download folder

## Next Steps

Once you have fetched results for all artifacts:
1. Move JSON file to `dashboard/data/you-search-results.json`
2. Update `dashboard/index.html` to display results instead of MCP panel
3. Commit and push to GitHub Pages

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Browser (Port 8080)                   │
│  ┌────────────────────────────────────────────────┐    │
│  │   fetch-you-manual.html                        │    │
│  │   - Click "Fetch Next Artifact"                │    │
│  │   - Sends request to localhost:8081            │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│            Proxy Server (Port 8081)                     │
│  ┌────────────────────────────────────────────────┐    │
│  │   you-proxy-server.js                          │    │
│  │   - Adds CORS headers                          │    │
│  │   - Adds X-API-Key from env                    │    │
│  │   - Forwards to You.com API                    │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                You.com API (HTTPS)                      │
│  ┌────────────────────────────────────────────────┐    │
│  │   https://api.ydc-index.io/search              │    │
│  │   - Processes search query                     │    │
│  │   - Returns web search results                 │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```
