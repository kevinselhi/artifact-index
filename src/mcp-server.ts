import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import express from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

type HeadingSummary = {
  level: number;
  title: string;
  line: number;
};

type ComparisonPayload = {
  status: 'ready' | 'pending';
  sourcePath: string;
  lastModified: string | null;
  format: 'markdown';
  headings: HeadingSummary[];
  content: string;
  note?: string;
};

type ValuationEntry = {
  id: string;
  name: string;
  sector: string;
  valuations: Record<string, number | null>;
  variance_ratio: number;
};

type ValuationsData = {
  artifacts: ValuationEntry[];
  metadata?: Record<string, unknown>;
};

const comparisonPath = path.resolve(
  process.cwd(),
  process.env.MODEL_COMPARISON_PATH ?? '7_model_comparison_analysis.md'
);
const valuationsPath = path.resolve(
  process.cwd(),
  process.env.VALUATIONS_PATH ?? 'dashboard/data/master_valuations.json'
);
const modelMetadataPath = path.resolve(
  process.cwd(),
  process.env.MODEL_METADATA_PATH ?? 'dashboard/data/model_metadata.json'
);
const newsPath = path.resolve(
  process.cwd(),
  process.env.NEWS_FEED_PATH ?? 'dashboard/data/industry-news.json'
);
const youApiKey = process.env.YOU_API_KEY;
const youBaseUrl = process.env.YOU_BASE_URL ?? 'https://api.ydc-index.io';

const comparisonResourceUri = 'resource://artifact-index/comparison';
const valuationsResourceUri = 'resource://artifact-index/valuations';
const modelsResourceUri = 'resource://artifact-index/models';
const artifactTemplate = new ResourceTemplate('resource://artifact-index/artifacts/{id}', {
  list: async () => ({
    resources: await listArtifactResources()
  })
});

const valuationsSchema = z.object({
  artifacts: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      sector: z.string(),
      valuations: z.record(z.union([z.string(), z.number()]), z.number().nullable()),
      variance_ratio: z.number()
    })
  ),
  metadata: z.record(z.string(), z.unknown()).optional()
});

const newsSchema = z.object({
  items: z.array(
    z.object({
      industry: z.string(),
      headline: z.string(),
      summary: z.string().optional(),
      source: z.string().optional(),
      url: z.string().optional(),
      date: z.string()
    })
  )
});

const server = new McpServer({
  name: 'artifact-index',
  version: '0.2.0'
});

function extractHeadings(text: string): HeadingSummary[] {
  return text
    .split('\n')
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => /^#{1,6}\s+/.test(line))
    .map(({ line, index }) => {
      const [, hashes, title] = line.match(/^(#+)\s+(.*)$/) ?? ['', '', ''];
      return {
        level: hashes.length,
        title: title.trim(),
        line: index + 1
      };
    })
    .filter(({ title }) => Boolean(title));
}

async function readComparison(): Promise<ComparisonPayload> {
  try {
    const [stats, contents] = await Promise.all([
      fs.stat(comparisonPath),
      fs.readFile(comparisonPath, 'utf8')
    ]);
    return {
      status: 'ready',
      sourcePath: comparisonPath,
      lastModified: stats.mtime.toISOString(),
      format: 'markdown',
      headings: extractHeadings(contents),
      content: contents
    };
  } catch (error) {
    const message =
      (error as NodeJS.ErrnoException).code === 'ENOENT'
        ? `Comparison markdown not found at ${comparisonPath}`
        : `Unable to read comparison markdown: ${(error as Error).message}`;
    return {
      status: 'pending',
      sourcePath: comparisonPath,
      lastModified: null,
      format: 'markdown',
      headings: [],
      content: '',
      note: message
    };
  }
}

async function readValuations(): Promise<ValuationsData> {
  const raw = await fs.readFile(valuationsPath, 'utf8');
  const json = JSON.parse(raw);
  const parsed = valuationsSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`Invalid valuations JSON: ${parsed.error.message}`);
  }
  return parsed.data;
}

async function readModels(): Promise<Record<string, unknown>> {
  const raw = await fs.readFile(modelMetadataPath, 'utf8');
  return JSON.parse(raw);
}

async function readNews() {
  try {
    const raw = await fs.readFile(newsPath, 'utf8');
    const json = JSON.parse(raw);
    const parsed = newsSchema.safeParse(json);
    if (!parsed.success) {
      throw new Error(parsed.error.message);
    }
    return parsed.data.items;
  } catch (error) {
    console.error('[mcp] News feed not available or invalid', error);
    return [];
  }
}

type YouResult = {
  title?: string;
  url?: string;
  description?: string;
  snippets?: string[];
  page_age?: string;
  source?: string;
};

async function callYou(endpoint: string, query: string, limit = 5) {
  if (!youApiKey) {
    return { error: 'YOU_API_KEY is not set; skipping live search.' };
  }
  const url = new URL(endpoint, youBaseUrl);
  url.searchParams.set('query', query);
  url.searchParams.set('count', String(limit));
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'X-API-Key': youApiKey,
      Accept: 'application/json'
    }
  });
  if (!res.ok) {
    const text = await res.text();
    return { error: `You.com API error: ${res.status} ${res.statusText}`, detail: text.slice(0, 500) };
  }
  const data = (await res.json()) as {
    results?: { web?: YouResult[]; news?: YouResult[] };
  };
  return data;
}

function simplifyResults(items: YouResult[] | undefined) {
  return (items ?? []).map((item) => ({
    title: item.title ?? '',
    url: item.url ?? '',
    snippet: item.description ?? item.snippets?.[0] ?? '',
    source: item.source ?? '',
    publishedAt: item.page_age ?? ''
  }));
}

async function listArtifactResources() {
  try {
    const data = await readValuations();
    return data.artifacts.map((a) => ({
      name: `artifact-${a.id}`,
      title: a.name,
      uri: `resource://artifact-index/artifacts/${encodeURIComponent(a.id)}`,
      description: `Artifact valuations for ${a.name} (${a.sector})`,
      mimeType: 'application/json'
    }));
  } catch (error) {
    console.error('[mcp] Failed to list artifacts', error);
    return [];
  }
}

// Resources
server.registerResource(
  'comparison',
  comparisonResourceUri,
  {
    title: '8-model comparison (JSON)',
    description: 'Parsed comparison markdown with headings and content',
    mimeType: 'application/json'
  },
  async () => {
    const payload = await readComparison();
    return {
      contents: [
        {
          uri: comparisonResourceUri,
          mimeType: 'application/json',
          text: JSON.stringify(payload, null, 2)
        }
      ]
    };
  }
);

server.registerResource(
  'valuations',
  valuationsResourceUri,
  {
    title: 'Artifact valuations (JSON)',
    description: 'Full valuations dataset (artifacts, sectors, variance)',
    mimeType: 'application/json'
  },
  async () => {
    const data = await readValuations();
    return {
      contents: [
        {
          uri: valuationsResourceUri,
          mimeType: 'application/json',
          text: JSON.stringify(data, null, 2)
        }
      ]
    };
  }
);

server.registerResource(
  'models',
  modelsResourceUri,
  {
    title: 'Model metadata (JSON)',
    description: 'Model characteristics, colors, and comparison insights',
    mimeType: 'application/json'
  },
  async () => {
    const data = await readModels();
    return {
      contents: [
        {
          uri: modelsResourceUri,
          mimeType: 'application/json',
          text: JSON.stringify(data, null, 2)
        }
      ]
    };
  }
);

server.registerResource(
  'artifacts',
  artifactTemplate,
  {
    title: 'Artifact valuations by id',
    description: 'Dynamic artifact valuations by id',
    mimeType: 'application/json'
  },
  async (uri, variables) => {
    const artifactId = variables.id;
    const data = await readValuations();
    const artifact = data.artifacts.find((a) => a.id === artifactId);
    if (!artifact) {
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify({
              error: `Artifact ${artifactId} not found`
            })
          }
        ]
      };
    }
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(artifact, null, 2)
        }
      ]
    };
  }
);

// Tools
const querySchema = z.object({
  sector: z.string().optional(),
  varianceMin: z.number().optional(),
  varianceMax: z.number().optional(),
  minModels: z.number().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(25)
});

server.registerTool(
  'query-artifacts',
  {
    title: 'Query artifacts',
    description: 'Filter artifacts by sector, variance range, model coverage, and search text'
  },
  async (args: any) => {
    const parsed = querySchema.parse(args ?? {});
    const { sector, varianceMin, varianceMax, minModels, search, limit } = parsed;
    const data = await readValuations();
    let results = data.artifacts.map((a) => ({
      ...a,
      models: Object.values(a.valuations).filter((v) => v !== null).length
    }));

    if (sector) {
      results = results.filter((a) => a.sector.toLowerCase() === sector.toLowerCase());
    }
    if (varianceMin !== undefined) {
      results = results.filter((a) => a.variance_ratio >= varianceMin);
    }
    if (varianceMax !== undefined) {
      results = results.filter((a) => a.variance_ratio <= varianceMax);
    }
    if (minModels !== undefined) {
      results = results.filter((a) => a.models >= minModels);
    }
    if (search) {
      const term = search.toLowerCase();
      results = results.filter(
        (a) => a.name.toLowerCase().includes(term) || a.id.toLowerCase().includes(term)
      );
    }
    results = results.slice(0, limit ?? 25);
    return {
      structuredContent: {
        artifacts: results.map((a) => ({
          id: a.id,
          name: a.name,
          sector: a.sector,
          variance_ratio: a.variance_ratio,
          models: a.models
        }))
      },
      content: [{ type: 'text' as const, text: JSON.stringify(results, null, 2) }]
    };
  }
);

server.registerTool(
  'top-variance',
  {
    title: 'Top variance artifacts',
    description: 'Return highest-variance artifacts (default 10)'
  },
  async (args: any) => {
    const limit = args?.limit ?? 10;
    const data = await readValuations();
    const artifacts = [...data.artifacts]
      .sort((a, b) => b.variance_ratio - a.variance_ratio)
      .slice(0, limit);
    return {
      structuredContent: {
        artifacts: artifacts.map((a) => ({
          id: a.id,
          name: a.name,
          sector: a.sector,
          variance_ratio: a.variance_ratio
        }))
      },
      content: [{ type: 'text' as const, text: JSON.stringify(artifacts, null, 2) }]
    };
  }
);

server.registerTool(
  'consensus',
  {
    title: 'Consensus artifacts',
    description: 'Return lowest-variance artifacts with at least 2 models'
  },
  async (args: any) => {
    const limit = args?.limit ?? 10;
    const data = await readValuations();
    const artifacts = data.artifacts
      .filter((a) => Object.values(a.valuations).filter((v) => v !== null).length >= 2)
      .sort((a, b) => a.variance_ratio - b.variance_ratio)
      .slice(0, limit);
    return {
      structuredContent: {
        artifacts: artifacts.map((a) => ({
          id: a.id,
          name: a.name,
          sector: a.sector,
          variance_ratio: a.variance_ratio
        }))
      },
      content: [{ type: 'text' as const, text: JSON.stringify(artifacts, null, 2) }]
    };
  }
);

server.registerTool(
  'list-models',
  {
    title: 'List models',
    description: 'Return model metadata for the 8 evaluated models'
  },
  async () => {
    const data = await readModels();
    return {
      structuredContent: {
        models: data
      },
      content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }]
    };
  }
);

server.registerTool(
  'industry-news',
  {
    title: 'Industry news (last 6 months of 2025)',
    description:
      'Return recent AI deployment news for a sector, filtered to the last six months of 2025 (requires NEWS_FEED_PATH JSON)'
  },
  async (args: any) => {
    const industry = args?.industry;
    const limit = args?.limit ?? 5;
    const items = await readNews();
    const windowStart = new Date('2025-07-01T00:00:00Z').getTime();
    const windowEnd = new Date('2025-12-31T23:59:59Z').getTime();
    let filtered = items.filter((item) => {
      const ts = Date.parse(item.date);
      return !Number.isNaN(ts) && ts >= windowStart && ts <= windowEnd;
    });
    if (industry) {
      const term = industry.toLowerCase();
      filtered = filtered.filter((i) => i.industry.toLowerCase().includes(term));
    }
    const limited = filtered.slice(0, limit);
    return {
      structuredContent: {
        news: limited,
        note:
          filtered.length === 0
            ? 'No news found in the last six months of 2025 for this industry or feed missing.'
            : undefined
      },
      content: [
        {
          type: 'text' as const,
          text:
            limited.length === 0
              ? 'No news available. Ensure NEWS_FEED_PATH points to a JSON feed with items[].'
              : JSON.stringify(limited, null, 2)
        }
      ]
    };
  }
);

server.registerTool(
  'you-news-search',
  {
    title: 'You.com News Search',
    description:
      'Live news search via You.com. Builds a query from industry + artifactType + AI agent terms. Requires YOU_API_KEY.'
  },
  async (args: any) => {
    if (!youApiKey) {
      return {
        structuredContent: { error: 'YOU_API_KEY not set; cannot run live news search.' },
        content: [{ type: 'text' as const, text: 'YOU_API_KEY not set; cannot run live news search.' }]
      };
    }
    const limit = args?.limit ?? 5;
    const industry = args?.industry ?? '';
    const artifactType = args?.artifactType ?? '';
    const query = `${industry} ${artifactType} ai pilot ai proof of concept agents pilot agents proof of concept ai return on investment agents return on investment`.trim();
    const data = await callYou('/news', query, limit);
    if ('error' in data) {
      return {
        structuredContent: { error: data.error, detail: (data as any).detail },
        content: [{ type: 'text' as const, text: data.error }]
      };
    }
    const simplified = simplifyResults(data.results?.news);
    return {
      structuredContent: { query, results: simplified },
      content: [{ type: 'text' as const, text: JSON.stringify(simplified, null, 2) }]
    };
  }
);

server.registerTool(
  'you-web-search',
  {
    title: 'You.com Web Search',
    description:
      'Live web search via You.com. Builds a query from industry + artifactType + AI agent terms. Requires YOU_API_KEY.'
  },
  async (args: any) => {
    if (!youApiKey) {
      return {
        structuredContent: { error: 'YOU_API_KEY not set; cannot run live web search.' },
        content: [{ type: 'text' as const, text: 'YOU_API_KEY not set; cannot run live web search.' }]
      };
    }
    const limit = args?.limit ?? 5;
    const industry = args?.industry ?? '';
    const artifactType = args?.artifactType ?? '';
    const query = `${industry} ${artifactType} ai pilot ai proof of concept agents pilot agents proof of concept ai return on investment agents return on investment`.trim();
    const data = await callYou('/search', query, limit);
    if ('error' in data) {
      return {
        structuredContent: { error: data.error, detail: (data as any).detail },
        content: [{ type: 'text' as const, text: data.error }]
      };
    }
    const simplified = simplifyResults(data.results?.web);
    return {
      structuredContent: { query, results: simplified },
      content: [{ type: 'text' as const, text: JSON.stringify(simplified, null, 2) }]
    };
  }
);

// Prompts for orchestrator and sector subagents
server.registerPrompt(
  'orchestrator',
  {
    title: 'Artifact Deep Dive Orchestrator',
    description:
      'Routes questions to sector subagents. Keep answers concise, cite valuations/variance, and recommend next steps.'
  },
  async () => ({
    messages: [
      {
        role: 'assistant',
        content: {
          type: 'text',
          text:
            'You are the Artifact Deep Dive guide for Kevin Selhi’s AI agent value research (2026 focus). Route questions to sector or artifact subagents, call tools when useful (query-artifacts, top-variance, consensus), and return concise, decision-ready answers. Always mention model coverage and variance when citing values. Keep responses short and actionable.'
        }
      }
    ]
  })
);

const sectorPrompts: Record<string, string> = {
  'Medical/Pharma':
    'Emphasize regulatory cadence (NDA/BLA, 510k, PMA), trial phases, and feasibility for agents in evidence gathering, protocol QA, and submission packaging.',
  Technology:
    'Focus on standardization, repeatability, and integration complexity (cloud migration, IAM, ERP). Highlight automation feasibility.',
  Engineering:
    'Prioritize risk, cost drivers, and design package standardization. Flag high variance items and reasons.',
  'Management Consulting':
    'Emphasize playbooks, repeatable frameworks, and data-heavy components where agents can assist.',
  'Financial Services':
    'Highlight regulatory/reporting consistency (S-1, fairness opinions, QoE). Note consensus vs. divergence across models.'
};

Object.entries(sectorPrompts).forEach(([sector, content]) => {
  server.registerPrompt(
    `sector-${sector.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    {
      title: `${sector} subagent`,
      description: `Subagent prompt for ${sector}`
    },
    async () => ({
      messages: [
        {
          role: 'assistant',
          content: { type: 'text', text: `${content} Always ground answers in artifact valuations and variance data.` }
        }
      ]
    })
  );
});

async function startHttp(port: number, allowedOrigins?: string[], allowedHosts?: string[]) {
  const app = express();
  app.use(express.json());

  // Store active MCP sessions
  const sessions = new Map<string, StreamableHTTPServerTransport>();

  // CORS middleware
  app.use((req, res, next) => {
    const origin = req.headers.origin;

    // If no allowedOrigins specified, allow all origins
    if (!allowedOrigins || (origin && allowedOrigins.includes(origin))) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, mcp-session-id');
      res.setHeader('Access-Control-Expose-Headers', 'mcp-session-id');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }

    next();
  });

  const corsCheck = (origin?: string | null, host?: string | null) => {
    if (allowedHosts && host && !allowedHosts.includes(host)) return false;
    if (allowedOrigins && origin && !allowedOrigins.includes(origin)) return false;
    return true;
  };

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', server: 'artifact-index-mcp', version: '0.2.0' });
  });

  // Root endpoint with info
  app.get('/', (_req, res) => {
    res.json({
      name: 'artifact-index-mcp',
      version: '0.2.0',
      description: 'MCP server for 2020 Human Artifact Index with You.com search integration',
      endpoints: {
        health: 'GET /health',
        mcp: 'POST /mcp'
      },
      tools: [
        'query-artifacts',
        'top-variance',
        'consensus',
        'list-models',
        'industry-news',
        'you-news-search',
        'you-web-search'
      ]
    });
  });

  app.post('/mcp', async (req, res) => {
    if (!corsCheck(req.headers.origin, req.headers.host)) {
      res.status(403).send('Forbidden');
      return;
    }

    // Get or create session
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    if (sessionId && sessions.has(sessionId)) {
      // Reuse existing session
      transport = sessions.get(sessionId)!;
      console.log(`[mcp] Reusing session: ${sessionId}`);
    } else {
      // Create new session
      const newSessionId = randomUUID();
      transport = new StreamableHTTPServerTransport({
        enableJsonResponse: true,
        sessionIdGenerator: () => newSessionId
      });
      sessions.set(newSessionId, transport);
      console.log(`[mcp] Created new session: ${newSessionId}`);

      // Connect to server for new session only
      await server.connect(transport);

      // Clean up session after 5 minutes of inactivity
      setTimeout(() => {
        if (sessions.has(newSessionId)) {
          console.log(`[mcp] Cleaning up inactive session: ${newSessionId}`);
          sessions.delete(newSessionId);
          transport.close();
        }
      }, 5 * 60 * 1000);
    }

    await transport.handleRequest(req, res, req.body);
  });

  app.listen(port, () => {
    console.log(`[mcp] HTTP server listening on port ${port}`);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const useHttp = args.includes('--http');
  const port = Number(process.env.PORT ?? process.env.port ?? '3000');
  if (useHttp) {
    const origins = process.env.HTTP_ORIGINS ? process.env.HTTP_ORIGINS.split(',') : undefined;
    const hosts = process.env.HTTP_HOSTS ? process.env.HTTP_HOSTS.split(',') : undefined;
    await startHttp(port, origins, hosts);
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
  }
}

main().catch((error) => {
  console.error('[mcp] Fatal error', error);
  process.exit(1);
});
