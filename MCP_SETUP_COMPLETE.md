# MCP Server Setup - Complete ✅

## What We Fixed

### 1. Rate Limiting Protection (529 Errors) ✅
**Problem:** MCP panel was always visible and users could spam the Test button, triggering You.com API rate limits.

**Solution:**
- Hide MCP panel by default
- Only show when artifact is selected in Deep Dive view
- Add 2-second cooldown between connection tests
- Disable Test button during cooldown

**Files Changed:**
- `dashboard/index.html` - Lazy-load MCP panel, debouncing

### 2. CORS Configuration ✅
**Problem:** Browser couldn't connect to localhost MCP server from any origin.

**Solution:**
- Added proper CORS headers to MCP server
- Allow `mcp-session-id` header in requests and responses
- Support preflight OPTIONS requests

**Files Changed:**
- `src/mcp-server.ts` - CORS middleware with header exposure

### 3. MCP Protocol Implementation ✅
**Problem:** Dashboard wasn't following MCP protocol (missing initialize, no session management).

**Solution:**
- Implement proper initialize handshake
- Extract and reuse `mcp-session-id` from responses
- Maintain session state across multiple requests

**Files Changed:**
- `dashboard/index.html` - Session ID tracking
- `src/mcp-server.ts` - Session persistence with Map storage

### 4. Session Management ✅
**Problem:** Server created new transport for each request, losing state ("Server not initialized" errors).

**Solution:**
- Store active sessions in Map keyed by session ID
- Reuse transport for requests with existing session ID
- Clean up sessions after 5 minutes of inactivity (not immediately)
- Add logging to track session creation/reuse

**Files Changed:**
- `src/mcp-server.ts` - Session Map with timeout-based cleanup

## Current Status

### ✅ Working
- **MCP Server Running:** http://localhost:3000/mcp
- **Dashboard Running:** http://localhost:8080/index.html
- **Test Page:** http://localhost:8080/test-mcp.html
- **Session Persistence:** Maintains state across requests
- **Resources Available:** 227 artifacts + 3 metadata resources
- **CORS:** Fully configured for browser access

### ⏳ Ready to Test (Needs API Key)
- **You.com News Search:** Requires `YOU_API_KEY`
- **You.com Web Search:** Requires `YOU_API_KEY`
- **Industry News:** Requires `NEWS_FEED_PATH` JSON file (optional)

## How to Use

### Testing the MCP Connection

1. **Start the MCP server:**
   ```bash
   npm run dev:http
   ```

2. **Open the test page:**
   ```
   http://localhost:8080/test-mcp.html
   ```

3. **Click "Test MCP Connection"**
   - Should see: ✓ Success!
   - Session ID: (UUID)
   - Resources found: 227

### Testing from the Dashboard

1. **Open dashboard:**
   ```
   http://localhost:8080/index.html
   ```

2. **Navigate to "Artifact Deep Dive" tab**

3. **Select any artifact** (e.g., "Leadership Development Program")
   - MCP panel appears automatically

4. **Click "Test" button**
   - Should see: "✓ MCP server is reachable (227 resources available)"

### Testing You.com Integration

1. **Set your API key:**
   ```bash
   export YOU_API_KEY="your-api-key-here"
   ```

2. **Restart MCP server:**
   ```bash
   # Kill existing server (Ctrl+C or kill process)
   npm run dev:http
   ```

3. **Run test script:**
   ```bash
   ./test-you-api.sh
   ```

   **Expected output:**
   - News search results for "Medical/Pharma Clinical Trial AI pilots"
   - Web search results for "Financial Services M&A Advisory AI agents"
   - Each with title, URL, snippet, source, publishedAt

## MCP Tools Available

### Data Tools (No API Key Required)
- `query-artifacts` - Filter artifacts by sector, variance, models
- `top-variance` - Get highest-variance artifacts
- `consensus` - Get lowest-variance artifacts with ≥2 models
- `list-models` - Get metadata for all 8 AI models
- `industry-news` - Cached news (requires NEWS_FEED_PATH JSON)

### You.com Tools (Require YOU_API_KEY)
- `you-news-search` - Live news via You.com News API
- `you-web-search` - Live web search via You.com Search API

### MCP Resources
- `resource://artifact-index/comparison` - 8-model comparison markdown
- `resource://artifact-index/valuations` - All artifact valuations
- `resource://artifact-index/models` - Model metadata
- `resource://artifact-index/artifacts/{id}` - Specific artifact data (227 available)

### MCP Prompts
- `orchestrator` - Main routing prompt for artifact queries
- `sector-medical-pharma` - Medical/Pharma subagent
- `sector-technology` - Technology subagent
- `sector-engineering` - Engineering subagent
- `sector-management-consulting` - Consulting subagent
- `sector-financial-services` - Financial services subagent

## Using with MCP Clients

The MCP server works with any MCP-enabled client:

### Claude Code (this session)
```
Use resource://artifact-index/valuations to see all artifacts
```

### VS Code / Cursor
Add to MCP settings:
```json
{
  "mcpServers": {
    "artifact-index": {
      "transport": "http",
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

### Direct HTTP Requests
```bash
# Initialize
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'

# List resources (use session ID from initialize response)
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: YOUR-SESSION-ID" \
  -d '{"jsonrpc":"2.0","id":2,"method":"resources/list","params":{}}'
```

## Troubleshooting

### Dashboard shows "MCP server not reachable"
1. Check if MCP server is running: `curl http://localhost:3000/health`
2. Check browser console for CORS errors
3. Make sure you're accessing via http://localhost:8080 (not file://)

### "Server not initialized" error
- This is fixed! Sessions are now persisted.
- If you still see it, check server logs for session creation/reuse

### You.com tools return "YOU_API_KEY not set"
- This is expected without the API key
- Set: `export YOU_API_KEY="your-key"`
- Restart MCP server

### Rate limit errors (529)
- 2-second cooldown prevents rapid testing
- If you hit limits, wait before retrying
- You have $60 in credits remaining

## Files Added/Modified

### New Files
- `dashboard/test-mcp.html` - Standalone MCP connection test
- `test-you-integration.md` - You.com API integration guide
- `test-you-api.sh` - Interactive test script
- `MCP_SETUP_COMPLETE.md` - This file

### Modified Files
- `dashboard/index.html` - MCP panel lazy-loading, session management
- `src/mcp-server.ts` - CORS, session persistence, logging

## Next Steps

### To Enable You.com Integration
1. Get your API key from You.com (hackathon credentials)
2. Set `export YOU_API_KEY="your-key"`
3. Restart MCP server
4. Run `./test-you-api.sh` to verify

### To Use in Production
The MCP server is designed for **local development and research**, not public deployment:
- GitHub Pages dashboard won't connect to localhost (Mixed Content security)
- MCP is meant for MCP-enabled clients (Claude Code, VS Code, Cursor)
- For public access, users would need to run the MCP server locally

### Optional Enhancements
- Add NEWS_FEED_PATH JSON file for cached industry news
- Implement caching for You.com results to preserve credits
- Add more MCP tools for specific research queries
- Create additional sector-specific prompts

## Summary

✅ **MCP Server:** Fully functional with 227 resources
✅ **Session Management:** Working with proper state persistence
✅ **CORS:** Configured for browser access
✅ **Rate Limiting:** Protected with 2-second cooldown
✅ **Dashboard Integration:** MCP panel lazy-loads on artifact selection
⏳ **You.com Integration:** Ready to test (needs API key)

**Status:** Production-ready for local MCP development! 🎉
