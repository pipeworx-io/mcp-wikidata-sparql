# @pipeworx/wikidata-sparql

Wikidata Query Service MCP — full SPARQL access to the entire Wikidata knowledge graph (~100M items, 1.5B statements). Complements the existing `wikidata` pack (which covers entity search + retrieval).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1679+ live data sources.

## Tools

- `query(sparql, format?)` — run a SPARQL query
- `instances_of(entity_id, limit?)` — convenience: all instances of a class (e.g. Q5 = humans)
- `subclasses_of(entity_id, limit?)` — convenience: subclass tree
- `properties_of(entity_id, limit?)` — convenience: statements about an entity
- `entities_at(latitude, longitude, radius_km?, instance_of?, limit?)` — geo-spatial query: items near a point

## No auth

The public WDQS at `https://query.wikidata.org/sparql` is keyless. Fair-use: ≤30 queries / min, ≤60 sec timeout per query. The pack sets a meaningful User-Agent (required by WMF policy).

## Tips

Wikidata is enormous — narrow your queries! Use `LIMIT`, `instance of` filters, and language tags. Bring schema knowledge from https://www.wikidata.org/wiki/Wikidata:List_of_properties.

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "wikidata-sparql": {
      "url": "https://gateway.pipeworx.io/wikidata-sparql/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/wikidata-sparql/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1679+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/wikidata_sparql_query \
  -H 'Content-Type: application/json' \
  -d '{"sparql":"SELECT ?item ?itemLabel WHERE { ?item wdt:P31 wd:Q5 . SERVICE wikibase:label { bd:serviceParam wikibase:language \"en\" } } LIMIT 10"}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/wikidata_sparql_query`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Standalone (no gateway account)

This package also runs as a local stdio MCP server — no Pipeworx account, no
gateway round-trip:

```json
{
  "mcpServers": {
    "wikidata-sparql": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-wikidata-sparql"]
    }
  }
}
```

Or run it directly to confirm it starts:

```bash
npx -y @pipeworx/mcp-wikidata-sparql
```

It speaks MCP over stdin/stdout and answers `initialize`/`tools/list`/`tools/call`
for **only** this pack's tools — none of the shared meta-tools the gateway
connection above adds. Same source, same tools, no ask_pipeworx routing.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Wikidata Sparql data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
