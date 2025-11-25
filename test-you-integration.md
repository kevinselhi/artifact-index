# Testing You.com Integration with MCP

## Setup

1. **Get your You.com API key** (you should have one from the hackathon with $60 remaining credits)

2. **Set the environment variable:**
   ```bash
   export YOU_API_KEY="your-api-key-here"
   ```

3. **Restart the MCP server:**
   ```bash
   npm run dev:http
   ```

## Test via curl

### Test 1: you-news-search tool
Search for news about a specific industry and artifact:

```bash
curl -s -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {"name": "test", "version": "1.0"}
    }
  }' | grep -o '"mcp-session-id":"[^"]*"' | cut -d'"' -f4
```

Save the session ID, then:

```bash
curl -s -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: YOUR-SESSION-ID-HERE" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "you-news-search",
      "arguments": {
        "industry": "Medical/Pharma",
        "artifactType": "Clinical Trial",
        "limit": 3
      }
    }
  }' | python3 -m json.tool
```

### Test 2: you-web-search tool
Search the web for information about AI pilots:

```bash
curl -s -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: YOUR-SESSION-ID-HERE" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "you-web-search",
      "arguments": {
        "industry": "Financial Services",
        "artifactType": "M&A Advisory",
        "limit": 3
      }
    }
  }' | python3 -m json.tool
```

## Test via Dashboard

Once the API key is set and server is running:

1. Open http://localhost:8080/index.html
2. Navigate to "Artifact Deep Dive"
3. Select any artifact (e.g., "Phase III Clinical Trial")
4. Click "Test" to connect to MCP
5. Use MCP-enabled clients (Claude Code, VS Code, Cursor) to call the You.com tools

## Expected Behavior

**With YOU_API_KEY set:**
- News search returns recent articles about AI in that industry/artifact
- Web search returns relevant web results about AI pilots and POCs
- Results include title, URL, snippet, source, publishedAt

**Without YOU_API_KEY:**
- Tools return error: "YOU_API_KEY not set; cannot run live search."
- This is expected behavior - the tools gracefully handle missing credentials

## Available Tools

1. **you-news-search** - Live news via You.com News API
   - Builds query: `{industry} {artifactType} ai pilot ai proof of concept agents...`
   - Returns news articles with metadata

2. **you-web-search** - Live web search via You.com Search API
   - Same query format as news search
   - Returns web results with snippets

3. **industry-news** - Cached news from JSON file (optional)
   - Filters last 6 months of 2025
   - Falls back if live search unavailable
   - Requires NEWS_FEED_PATH JSON file

## Rate Limits

- You have $60 in API credits remaining
- Use sparingly to preserve credits
- Consider caching results for repeated queries
