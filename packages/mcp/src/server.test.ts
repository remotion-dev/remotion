import {expect, test} from 'bun:test';
import {handleJsonRpcMessage} from './server.js';

const asFetch = (
	implementation: (url: string | URL | Request) => Promise<Response>,
): typeof fetch => {
	return implementation as unknown as typeof fetch;
};

test('responds to initialize without touching the network', async () => {
	const sent: unknown[] = [];
	let fetched = false;

	await handleJsonRpcMessage(
		{
			jsonrpc: '2.0',
			id: 1,
			method: 'initialize',
			params: {
				protocolVersion: '2025-11-25',
				capabilities: {},
				clientInfo: {name: 'test', version: '0.0.0'},
			},
		},
		(message: unknown) => sent.push(message),
		asFetch(() => {
			fetched = true;
			return Promise.reject(
				new Error('initialize should not fetch documentation'),
			);
		}),
	);

	expect(fetched).toBe(false);
	expect(sent).toEqual([
		{
			result: {
				protocolVersion: '2025-11-25',
				capabilities: {tools: {listChanged: true}},
				serverInfo: {name: 'remotion-mcp', version: '1.0.0'},
			},
			jsonrpc: '2.0',
			id: 1,
		},
	]);
});

test('negotiates supported initialize protocol versions', async () => {
	const sent: unknown[] = [];

	await handleJsonRpcMessage(
		{
			jsonrpc: '2.0',
			id: 1,
			method: 'initialize',
			params: {protocolVersion: '2024-11-05'},
		},
		(message: unknown) => sent.push(message),
	);
	await handleJsonRpcMessage(
		{
			jsonrpc: '2.0',
			id: 2,
			method: 'initialize',
			params: {protocolVersion: 'not-supported'},
		},
		(message: unknown) => sent.push(message),
	);

	expect(sent).toEqual([
		expect.objectContaining({
			result: expect.objectContaining({protocolVersion: '2024-11-05'}),
		}),
		expect.objectContaining({
			result: expect.objectContaining({protocolVersion: '2025-11-25'}),
		}),
	]);
});

test('lists the Remotion documentation tool', async () => {
	const sent: unknown[] = [];

	await handleJsonRpcMessage(
		{jsonrpc: '2.0', id: 2, method: 'tools/list', params: {}},
		(message: unknown) => sent.push(message),
	);

	expect(sent).toEqual([
		{
			result: {
				tools: [
					{
						name: 'remotion-documentation',
						title: 'Search the Remotion documentation',
						description: 'Search the Remotion documentation',
						inputSchema: {
							$schema: 'http://json-schema.org/draft-07/schema#',
							type: 'object',
							properties: {query: {type: 'string'}},
							required: ['query'],
						},
						execution: {taskSupport: 'forbidden'},
					},
				],
			},
			jsonrpc: '2.0',
			id: 2,
		},
	]);
});

test('responds to ping', async () => {
	const sent: unknown[] = [];

	await handleJsonRpcMessage(
		{jsonrpc: '2.0', id: 3, method: 'ping', params: {}},
		(message: unknown) => sent.push(message),
	);

	expect(sent).toEqual([
		{
			result: {},
			jsonrpc: '2.0',
			id: 3,
		},
	]);
});

test('calls the documentation endpoint with an encoded query', async () => {
	const sent: unknown[] = [];
	const urls: string[] = [];

	await handleJsonRpcMessage(
		{
			jsonrpc: '2.0',
			id: 3,
			method: 'tools/call',
			params: {
				name: 'remotion-documentation',
				arguments: {query: 'render video & audio'},
			},
		},
		(message: unknown) => sent.push(message),
		asFetch((url) => {
			urls.push(String(url));
			return Promise.resolve(new Response('docs result'));
		}),
	);

	expect(urls).toEqual([
		'https://mcp.remotion.dev/mcp/67cad4626afeae106c6ffb50?query=render%20video%20%26%20audio',
	]);
	expect(sent).toEqual([
		{
			result: {content: [{type: 'text', text: 'docs result'}]},
			jsonrpc: '2.0',
			id: 3,
		},
	]);
});
