# mcp-wikidata-sparql

Wikidata SPARQL MCP — Wikidata Query Service

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 250+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `query` | Run a SPARQL query against the Wikidata Query Service. Returns JSON bindings by default. |
| `instances_of` | Convenience: list all items that are an instance of a Wikidata class. |
| `subclasses_of` | Convenience: subclass tree (P279 transitive) of a class. |
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

Or connect to the full Pipeworx gateway for access to all 250+ data sources:

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
