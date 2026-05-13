interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Wikidata SPARQL MCP — Wikidata Query Service
 *
 * Auth: none. Wikimedia requires a descriptive User-Agent.
 * Docs: https://www.wikidata.org/wiki/Wikidata:SPARQL_query_service/API
 */


const ENDPOINT = 'https://query.wikidata.org/sparql';
const UA = 'pipeworx-mcp-wikidata-sparql/1.0 (+https://pipeworx.io; bruce@mojibake.ai)';

const tools: McpToolExport['tools'] = [
  {
    name: 'query',
    description: 'Run a SPARQL query against the Wikidata Query Service. Returns JSON bindings by default.',
    inputSchema: {
      type: 'object',
      properties: {
        sparql: { type: 'string', description: 'SPARQL query text' },
        format: { type: 'string', description: 'json (default) | xml | csv | tsv | text/html' },
      },
      required: ['sparql'],
    },
  },
  {
    name: 'instances_of',
    description: 'Convenience: list all items that are an instance of a Wikidata class.',
    inputSchema: {
      type: 'object',
      properties: {
        entity_id: { type: 'string', description: 'Class id (e.g. "Q5" = humans, "Q5398426" = TV series)' },
        lang: { type: 'string', description: 'Language for labels (default en)' },
        limit: { type: 'number', description: 'Max items (default 100, max 10000)' },
      },
      required: ['entity_id'],
    },
  },
  {
    name: 'subclasses_of',
    description: 'Convenience: subclass tree (P279 transitive) of a class.',
    inputSchema: {
      type: 'object',
      properties: {
        entity_id: { type: 'string' },
        lang: { type: 'string' },
        limit: { type: 'number' },
      },
      required: ['entity_id'],
    },
  },
  {
    name: 'properties_of',
    description: 'Convenience: all statements (property → value) about an entity.',
    inputSchema: {
      type: 'object',
      properties: {
        entity_id: { type: 'string', description: 'Item id (e.g. "Q42" = Douglas Adams)' },
        lang: { type: 'string' },
        limit: { type: 'number' },
      },
      required: ['entity_id'],
    },
  },
  {
    name: 'entities_at',
    description: 'Geo-spatial query: items near a point. Use instance_of to filter by class.',
    inputSchema: {
      type: 'object',
      properties: {
        latitude: { type: 'number' },
        longitude: { type: 'number' },
        radius_km: { type: 'number', description: 'Search radius in km (default 1)' },
        instance_of: { type: 'string', description: 'Class id filter (e.g. "Q33506" = museum)' },
        lang: { type: 'string' },
        limit: { type: 'number' },
      },
      required: ['latitude', 'longitude'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'query':
      return runSparql(reqStr(args, 'sparql', '"SELECT ?p WHERE { ?p wdt:P31 wd:Q5 } LIMIT 5"'), (args.format as string) ?? 'json');
    case 'instances_of': {
      const id = sanitizeQid(reqStr(args, 'entity_id', '"Q5"'));
      const limit = clampLimit((args.limit as number) ?? 100);
      const lang = (args.lang as string) ?? 'en';
      const q = `SELECT ?item ?itemLabel WHERE {
        ?item wdt:P31 wd:${id} .
        SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang},en". }
      } LIMIT ${limit}`;
      return runSparql(q, 'json');
    }
    case 'subclasses_of': {
      const id = sanitizeQid(reqStr(args, 'entity_id', '"Q11424"'));
      const limit = clampLimit((args.limit as number) ?? 100);
      const lang = (args.lang as string) ?? 'en';
      const q = `SELECT ?subclass ?subclassLabel WHERE {
        ?subclass wdt:P279* wd:${id} .
        SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang},en". }
      } LIMIT ${limit}`;
      return runSparql(q, 'json');
    }
    case 'properties_of': {
      const id = sanitizeQid(reqStr(args, 'entity_id', '"Q42"'));
      const limit = clampLimit((args.limit as number) ?? 100);
      const lang = (args.lang as string) ?? 'en';
      const q = `SELECT ?prop ?propLabel ?value ?valueLabel WHERE {
        wd:${id} ?p ?value .
        ?prop wikibase:directClaim ?p .
        SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang},en". }
      } LIMIT ${limit}`;
      return runSparql(q, 'json');
    }
    case 'entities_at': {
      const lat = reqNum(args, 'latitude', '40.7128');
      const lon = reqNum(args, 'longitude', '-74.006');
      const radius = (args.radius_km as number) ?? 1;
      const lang = (args.lang as string) ?? 'en';
      const limit = clampLimit((args.limit as number) ?? 50);
      const inst = args.instance_of ? sanitizeQid(String(args.instance_of)) : null;
      const instFilter = inst ? `?item wdt:P31/wdt:P279* wd:${inst} .` : '';
      const q = `SELECT ?item ?itemLabel ?coord ?distance WHERE {
        ${instFilter}
        SERVICE wikibase:around {
          ?item wdt:P625 ?coord .
          bd:serviceParam wikibase:center "Point(${lon} ${lat})"^^geo:wktLiteral .
          bd:serviceParam wikibase:radius "${radius}" .
          bd:serviceParam wikibase:distance ?distance .
        }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang},en". }
      } ORDER BY ASC(?distance) LIMIT ${limit}`;
      return runSparql(q, 'json');
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function runSparql(query: string, format: string) {
  const formats: Record<string, string> = {
    json: 'application/sparql-results+json',
    xml: 'application/sparql-results+xml',
    csv: 'text/csv',
    tsv: 'text/tab-separated-values',
    'text/html': 'text/html',
  };
  const accept = formats[format] ?? formats.json;
  const res = await fetch(`${ENDPOINT}?query=${encodeURIComponent(query)}`, {
    headers: { Accept: accept, 'User-Agent': UA },
  });
  if (res.status === 429) throw new Error('WDQS: rate-limit (HTTP 429)');
  if (res.status === 500 || res.status === 502 || res.status === 503) {
    const t = await res.text();
    throw new Error(`WDQS upstream error: ${res.status} ${t.slice(0, 200)}`);
  }
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`WDQS error: ${res.status} ${t.slice(0, 200)}`);
  }
  if (accept === formats.json) return res.json();
  return { format, body: await res.text() };
}

function sanitizeQid(id: string): string {
  // Allow only Q/P followed by digits.
  if (!/^[QP]\d+$/i.test(id)) {
    throw new Error(`Invalid Wikidata id "${id}". Expected Q<digits> or P<digits>.`);
  }
  return id.toUpperCase();
}

function clampLimit(n: number): number {
  return Math.min(10000, Math.max(1, n));
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}
function reqNum(args: Record<string, unknown>, key: string, example: string): number {
  const v = args[key];
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    throw new Error(`Required argument "${key}" must be a number. Example: ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
