# @remotion/mcp

Remotion's Model Context Protocol

[![NPM Downloads](https://img.shields.io/npm/dm/@remotion/mcp.svg?style=flat&color=black&label=Downloads)](https://npmcharts.com/compare/@remotion/mcp?minimal=true)

> [!WARNING]
> `@remotion/mcp` is deprecated. Install [Remotion Agent Skills](https://www.remotion.dev/docs/ai/skills) and use `/remotion-docs` instead.
>
> The hosted MCP will shut down no earlier than August 31, 2026. Follow [GitHub issue #9055](https://github.com/remotion-dev/remotion/issues/9055) for updates.

## Why is the MCP being shut down?

- Its data can be less current than the Remotion documentation.
- Remotion pays the token costs for MCP requests.
- Installing MCP servers is difficult, and agents do not invoke them reliably.
- It duplicates the `/remotion-docs` skill.

## Migration

Install the Remotion Agent Skills from your Remotion project:

```bash
npx remotion skills add
```

Remove `remotion-documentation` from the MCP configuration in your editor, then ask your coding agent to use `/remotion-docs` when it needs current Remotion documentation.

See the [migration guide](https://www.remotion.dev/docs/ai/mcp) for more information.
