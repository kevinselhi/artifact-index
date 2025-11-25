import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

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

const comparisonFile = process.env.MODEL_COMPARISON_PATH ?? '7_model_comparison_analysis.md';
const comparisonPath = path.resolve(process.cwd(), comparisonFile);
const comparisonResourceUri = 'comparison://model-comparison';

const server = new McpServer({
  name: 'artifact-index-comparison',
  version: '0.1.0'
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

async function buildComparisonPayload(): Promise<ComparisonPayload> {
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
        ? `Comparison markdown not found yet at ${comparisonPath}`
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

server.registerResource(
  'model-comparison',
  new ResourceTemplate(comparisonResourceUri, {
    list: async () => ({
      resources: [
        {
          name: 'model-comparison',
          title: '8-model comparison (JSON)',
          uri: comparisonResourceUri,
          description:
            'JSON view of the 8-model evaluation markdown. Set MODEL_COMPARISON_PATH or defaults to 7_model_comparison_analysis.md',
          mimeType: 'application/json'
        }
      ]
    })
  }),
  {
    title: '8-model comparison (JSON)',
    description: 'Serves the 8-model comparison markdown as structured JSON',
    mimeType: 'application/json'
  },
  async () => {
    const payload = await buildComparisonPayload();
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('[mcp] Fatal error', error);
  process.exit(1);
});
