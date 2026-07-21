# mcp-wikidata-sparql

Wikidata SPARQL MCP — Wikidata Query Service

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1338+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `query` | Run a SPARQL query against the Wikidata Query Service. Returns JSON bindings by default. |
| `instances_of` | Convenience: list all items that are an instance of a Wikidata class. |
| `subclasses_of` | Return all subclasses of a Wikidata class via transitive P279 (subclass-of) traversal; takes a Wikidata entity id (e.g. Q11424) and returns labelled subclass items up to the specified limit. |
| `properties_of` | Convenience: all statements (property → value) about an entity. |
| `entities_at` | Geo-spatial query: items near a point. Use instance_of to filter by class. |

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

Or connect to the full Pipeworx gateway for access to all 1338+ data sources:

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

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
