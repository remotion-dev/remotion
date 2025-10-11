#! /usr/bin/env node

import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {z} from 'zod';

const HOST = 'https://mcp.remotion.dev';

const server = new McpServer({
	name: 'remotion-mcp',
	version: '1.0.0',
});

server.tool(
	'remotion-documentation',
	{
		query: z.string({
			description: 'The query to search for. Keep it short and concise.',
		}),
	},
	async ({query}: {query: string}) => {
		const res = await fetch(
			`${HOST}/mcp/67cad4626afeae106c6ffb50?query=${query}`,
		);

		return {
			content: [{type: 'text', text: await res.text()}],
		};
	},
);

const transport = new StdioServerTransport();
await server.connect(transport);
