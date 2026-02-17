#! /usr/bin/env node

import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import * as z from 'zod/v4';

const HOST = 'https://mcp.remotion.dev';

const server = new McpServer({
	name: 'remotion-mcp',
	version: '1.0.0',
});

server.registerTool(
	'remotion-documentation',
	{
		title: 'Search the Remotion documentation',
		description: 'Search the Remotion documentation',
		inputSchema: {
			query: z.string({
				message: 'The query to search for. Keep it short and concise.',
			}),
		},
	},
	async ({query}: {query: string}) => {
		const res = await fetch(
			`${HOST}/mcp/67cad4626afeae106c6ffb50?query=${query}`,
		);
		return {content: [{type: 'text' as const, text: await res.text()}]};
	},
);

const transport = new StdioServerTransport();
await server.connect(transport);
