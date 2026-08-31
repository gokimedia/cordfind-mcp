# CordFind Generator Compatibility MCP Server

[![MCPVault listing](https://mcpvault.io/badge/cordfind-mcp.svg)](https://mcpvault.io/servers/cordfind-mcp)
[![AllMCPs Verified](https://allmcps.com/api/badge/cordfind-generator-compatibility-mcp?style=shield)](https://allmcps.com/mcp/cordfind-generator-compatibility-mcp)

[CordFind](https://cordfind.com/) provides a public Model Context Protocol server for generator cord, plug, connector, and sizing research.

## Connect

Use the hosted Streamable HTTP endpoint:

```json
{
  "mcpServers": {
    "cordfind": {
      "url": "https://cordfind.com/api/mcp"
    }
  }
}
```

Clients that only support local stdio servers can use `mcp-remote`:

```json
{
  "mcpServers": {
    "cordfind": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://cordfind.com/api/mcp"]
    }
  }
}
```

The server is public and does not require an API key. Read the full [CordFind MCP documentation](https://cordfind.com/mcp).

## Tools

### `search_generator_guides`

Search CordFind generator guides by topic or question. Results include titles, descriptions, quick answers, and direct CordFind source URLs.

Inputs:

- `query` — generator topic or question
- `limit` — optional result limit from 1 to 10

### `get_connector_compatibility`

Screen a generator receptacle, destination, and cord distance for direct compatibility, adapter needs, verification boundaries, or unsafe paths.

Inputs:

- `sourceConnectorId` — `l1430`, `l1420`, `l630`, `l530`, `1450`, `cs50`, `tt30`, or `520`
- `targetId` — `inlet`, `rv`, `appliance`, or `distribution`
- `distanceFeet` — `25`, `50`, or `100`

Use the human-facing [generator cord finder](https://cordfind.com/cord-finder) to inspect the same workflow.

### `calculate_generator_cord_size`

Compare common American Wire Gauge sizes against planning ampacity and voltage-drop limits.

Inputs:

- `amps` — `15`, `20`, `30`, or `50`
- `volts` — `120` or `240`
- `distanceFeet` — one-way distance from 10 to 200 feet
- `dropLimitPercent` — `3` or `5`

Open the [generator cord-size calculator](https://cordfind.com/generator-cord-size-calculator) for the interactive version and methodology.

## Registry manifest

The official MCP Registry manifest is available in [`server.json`](./server.json) and from CordFind at:

```text
https://cordfind.com/.well-known/mcp/server.json
```

## Safety boundary

CordFind MCP responses are planning guidance, not approval for an electrical installation. Verify equipment labels, listings, ratings, and manufacturer instructions. Building wiring requires approved transfer equipment and qualified installation.

## Links

- [CordFind](https://cordfind.com/)
- [MCP server documentation](https://cordfind.com/mcp)
- [Official MCP Registry record](https://registry.modelcontextprotocol.io/v0.1/servers/io.github.gokimedia%2Fcordfind-generator-compatibility/versions/latest)
- [Smithery server page](https://smithery.ai/servers/gokimedia/cordfind)
- [Glama connector page](https://glama.ai/mcp/connectors/io.github.gokimedia/cordfind-generator-compatibility)
- [Generator plug library](https://cordfind.com/generator-plug)
- [Generator cord-size calculator](https://cordfind.com/generator-cord-size-calculator)

## License

The manifest and documentation in this repository are licensed under the MIT License. CordFind site content and compatibility data remain subject to the terms published on CordFind.
