# You.com API Documentation

## Quick Summary

The You.com Search API provides real-time web and news search results optimized for LLMs and AI applications. It returns structured, citation-backed results suitable for RAG (Retrieval Augmented Generation) workflows.

**Key Stats:** 93% accuracy on SimpleQA benchmark, ~466ms average latency

### Quick Start

1. Get an API key at [api.you.com](https://api.you.com)
2. Use header: `X-API-Key: <your_api_key>`
3. Make GET requests to `https://api.ydc-index.io/search` or `https://api.ydc-index.io/news`

---

## Authentication

**Header Format:**
```
X-API-Key: <your_api_key>
```

For Databricks Unity Catalog integration with Bearer token:
```
Authorization: Bearer <your_api_key>
```
Use `/v2/search` endpoint for Bearer token auth.

**Get API Key:** Visit [api.you.com](https://api.you.com) (self-serve portal)

---

## Endpoints

### 1. Unified Search API

**Base URL:** `https://api.ydc-index.io/search`
**Alternative:** `https://ydc-index.io/v1/search`

Returns combined web and news results based on query classification.

### 2. News API

**Base URL:** `https://api.ydc-index.io/news`

Dedicated news search across hundreds of publishers with real-time results (within minutes of breaking news).

---

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query (supports search operators) |
| `count` | integer | No | Max results per section (web/news) |
| `num_web_results` | integer | No | Alias for count |
| `freshness` | string | No | Time filter: `day`, `week`, `month`, `year`, or `YYYY-MM-DDtoYYYY-MM-DD` |
| `offset` | integer | No | Pagination offset (0-9 range, multiples of count) |
| `country` | string | No | Country code for geographic focus |
| `language` | string | No | BCP 47 language code (e.g., `en`, `es`) |
| `safesearch` | string | No | Content filter: `off`, `moderate`, `strict` |
| `livecrawl` | string | No | Sections to crawl: `web`, `news`, `all` |
| `livecrawl_format` | string | No | Content format: `html` or `markdown` |

### Search Operators

- Site filtering: `site:example.com`
- File types: `filetype:pdf`
- Exact terms: `"exact phrase"`
- Language filtering

---

## Response Schema

### Success Response (200)

```json
{
  "results": {
    "web": [
      {
        "url": "string",
        "title": "string",
        "description": "string",
        "snippets": ["string"],
        "thumbnail_url": "string",
        "page_age": "2024-01-15T12:00:00Z",
        "authors": ["string"],
        "favicon_url": "string"
      }
    ],
    "news": [
      {
        "title": "string",
        "description": "string",
        "url": "string",
        "thumbnail_url": "string",
        "page_age": "2024-01-15T12:00:00Z"
      }
    ]
  },
  "metadata": {
    "request_uuid": "uuid-string",
    "query": "original query",
    "latency": 0.466
  }
}
```

### Response Fields

**Web Results:**
| Field | Type | Description |
|-------|------|-------------|
| `url` | string | Direct link to the page |
| `title` | string | Page title |
| `description` | string | Page meta description |
| `snippets` | string[] | Relevant text excerpts |
| `thumbnail_url` | string | Preview image URL |
| `page_age` | datetime | Publication/update date |
| `authors` | string[] | Content authors (if available) |
| `favicon_url` | string | Site favicon URL |

**News Results:**
| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Article headline |
| `description` | string | Article summary |
| `url` | string | Direct link to article |
| `thumbnail_url` | string | Article image |
| `page_age` | datetime | Publication date |

### Error Responses

| Code | Description |
|------|-------------|
| 401 | Unauthorized - Invalid or missing API key |
| 403 | Forbidden - Insufficient API scope |
| 500 | Internal server error |

---

## Sample cURL Commands

### Web Search

```bash
curl -X GET "https://api.ydc-index.io/search?query=artificial+intelligence+trends" \
  -H "X-API-Key: YOUR_API_KEY"
```

### News Search

```bash
curl -X GET "https://api.ydc-index.io/news?query=technology+news" \
  -H "X-API-Key: YOUR_API_KEY"
```

### Search with Filters

```bash
curl -X GET "https://api.ydc-index.io/search?query=climate+change&count=10&freshness=week&country=US&language=en" \
  -H "X-API-Key: YOUR_API_KEY"
```

### Search with Date Range

```bash
curl -X GET "https://api.ydc-index.io/search?query=earnings+report&freshness=2024-01-01to2024-03-31" \
  -H "X-API-Key: YOUR_API_KEY"
```

### Livecrawl (Full Page Content)

```bash
curl -X GET "https://api.ydc-index.io/search?query=example&livecrawl=web&livecrawl_format=markdown" \
  -H "X-API-Key: YOUR_API_KEY"
```

---

## Rate Limits

Rate limits are not explicitly documented in the public API reference. Contact [api@you.com](mailto:api@you.com) for specific rate limit information based on your plan.

---

## Best Practices

1. **Use appropriate freshness filters** - For time-sensitive queries, use `day` or `week` to get recent results
2. **Leverage search operators** - Use `site:`, `filetype:`, and exact phrases for precise results
3. **Handle pagination** - Use `offset` parameter for paginating through results
4. **Cache responses** - Cache results when appropriate to reduce API calls
5. **Use livecrawl sparingly** - Fetching full page content increases latency; use only when needed
6. **Specify language/country** - For localized results, always include `language` and `country` parameters

---

## Additional Resources

- **Official Documentation:** [documentation.you.com](https://documentation.you.com)
- **API Reference:** [documentation.you.com/api-reference/search](https://documentation.you.com/api-reference/search)
- **MCP Server:** [documentation.you.com/tools/mcp-server](https://documentation.you.com/tools/mcp-server)
- **Developer Portal:** [api.you.com](https://api.you.com)
- **Support:** [api@you.com](mailto:api@you.com)

---

*Last updated: November 2025*
