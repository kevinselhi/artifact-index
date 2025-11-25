#!/bin/bash

# Test You.com API Integration with MCP Server

echo "=== You.com API Integration Test ==="
echo ""

# Check if API key is set
if [ -z "$YOU_API_KEY" ]; then
    echo "❌ YOU_API_KEY is not set!"
    echo ""
    echo "To set it:"
    echo "  export YOU_API_KEY='your-api-key-here'"
    echo ""
    echo "You have \$60 in API credits from the You.com Agentic Hackathon 2025."
    exit 1
fi

echo "✓ YOU_API_KEY is set (${#YOU_API_KEY} characters)"
echo ""

# Initialize session
echo "Initializing MCP session..."
INIT_RESPONSE=$(curl -s -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {"name": "you-api-test", "version": "1.0"}
    }
  }')

SESSION_ID=$(echo "$INIT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('mcp-session-id', ''))" 2>/dev/null)

if [ -z "$SESSION_ID" ]; then
    # Try to extract from headers
    SESSION_ID=$(curl -i -s -X POST http://localhost:3000/mcp \
      -H "Content-Type: application/json" \
      -H "Accept: application/json, text/event-stream" \
      -d '{
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
          "protocolVersion": "2024-11-05",
          "capabilities": {},
          "clientInfo": {"name": "you-api-test", "version": "1.0"}
        }
      }' 2>&1 | grep -i "mcp-session-id:" | cut -d' ' -f2 | tr -d '\r')
fi

echo "Session ID: $SESSION_ID"
echo ""

# Test 1: News Search
echo "=== Test 1: You.com News Search ==="
echo "Query: Medical/Pharma Clinical Trial AI pilots and proof of concepts"
echo ""

curl -s -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: $SESSION_ID" \
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

echo ""
echo ""

# Test 2: Web Search
echo "=== Test 2: You.com Web Search ==="
echo "Query: Financial Services M&A Advisory AI agents"
echo ""

curl -s -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: $SESSION_ID" \
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

echo ""
echo "=== Test Complete ==="
