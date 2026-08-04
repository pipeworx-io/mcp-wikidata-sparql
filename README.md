# @pipeworx/wikidata-sparql

Wikidata Query Service MCP — full SPARQL access to the entire Wikidata knowledge graph (~100M items, 1.5B statements). Complements the existing `wikidata` pack (which covers entity search + retrieval).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Wikidata Sparql data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
