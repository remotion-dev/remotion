type JsonRpcId = string | number | null;

type JsonRpcRequest = {
	jsonrpc?: string;
	id?: JsonRpcId;
	method?: string;
	params?: unknown;
};

type JsonRpcResponse = {
	jsonrpc: '2.0';
	id: JsonRpcId;
	result?: unknown;
	error?: {
		code: number;
		message: string;
	};
};

type SendMessage = (message: JsonRpcResponse) => void;

type ToolCallParams = {
	name?: unknown;
	arguments?: unknown;
};

type Fetch = typeof fetch;

const HOST = 'https://mcp.remotion.dev';
const DOCUMENTATION_TOOL_NAME = 'remotion-documentation';
const LATEST_PROTOCOL_VERSION = '2025-11-25';
const SUPPORTED_PROTOCOL_VERSIONS = new Set([
	'2024-11-05',
	'2025-03-26',
	LATEST_PROTOCOL_VERSION,
]);

const getRequestId = (message: JsonRpcRequest): JsonRpcId => {
	return Object.hasOwn(message, 'id') ? (message.id ?? null) : null;
};

const createError = (
	id: JsonRpcId,
	code: number,
	message: string,
): JsonRpcResponse => {
	return {
		jsonrpc: '2.0',
		id,
		error: {
			code,
			message,
		},
	};
};

const documentationTool = {
	name: DOCUMENTATION_TOOL_NAME,
	title: 'Search the Remotion documentation',
	description: 'Search the Remotion documentation',
	inputSchema: {
		$schema: 'http://json-schema.org/draft-07/schema#',
		type: 'object',
		properties: {
			query: {
				type: 'string',
			},
		},
		required: ['query'],
	},
	execution: {
		taskSupport: 'forbidden',
	},
} as const;

const getQuery = (params: unknown): string | null => {
	if (typeof params !== 'object' || params === null) {
		return null;
	}

	const {name, arguments: args} = params as ToolCallParams;
	if (name !== DOCUMENTATION_TOOL_NAME) {
		return null;
	}

	if (typeof args !== 'object' || args === null) {
		return null;
	}

	const {query} = args as {query?: unknown};
	return typeof query === 'string' ? query : null;
};

const getProtocolVersion = (params: unknown): string => {
	if (typeof params !== 'object' || params === null) {
		return LATEST_PROTOCOL_VERSION;
	}

	const {protocolVersion} = params as {protocolVersion?: unknown};
	return typeof protocolVersion === 'string' &&
		SUPPORTED_PROTOCOL_VERSIONS.has(protocolVersion)
		? protocolVersion
		: LATEST_PROTOCOL_VERSION;
};

export const handleJsonRpcMessage = async (
	message: JsonRpcRequest,
	send: SendMessage,
	fetchImplementation: Fetch = fetch,
): Promise<void> => {
	const id = getRequestId(message);

	if (typeof message.method !== 'string') {
		send(createError(id, -32600, 'Invalid Request'));
		return;
	}

	if (!Object.hasOwn(message, 'id')) {
		return;
	}

	if (message.method === 'initialize') {
		send({
			result: {
				protocolVersion: getProtocolVersion(message.params),
				capabilities: {
					tools: {
						listChanged: true,
					},
				},
				serverInfo: {
					name: 'remotion-mcp',
					version: '1.0.0',
				},
			},
			jsonrpc: '2.0',
			id,
		});
		return;
	}

	if (message.method === 'tools/list') {
		send({
			result: {
				tools: [documentationTool],
			},
			jsonrpc: '2.0',
			id,
		});
		return;
	}

	if (message.method === 'ping') {
		send({
			result: {},
			jsonrpc: '2.0',
			id,
		});
		return;
	}

	if (message.method === 'tools/call') {
		const query = getQuery(message.params);
		if (query === null) {
			send(createError(id, -32602, 'Invalid tool call parameters'));
			return;
		}

		try {
			const res = await fetchImplementation(
				`${HOST}/mcp/67cad4626afeae106c6ffb50?query=${encodeURIComponent(
					query,
				)}`,
			);
			send({
				result: {content: [{type: 'text' as const, text: await res.text()}]},
				jsonrpc: '2.0',
				id,
			});
		} catch (err) {
			send(
				createError(
					id,
					-32603,
					err instanceof Error ? err.message : 'Internal error',
				),
			);
		}

		return;
	}

	send(createError(id, -32601, 'Method not found'));
};

export const serializeMessage = (message: JsonRpcResponse): string => {
	return `${JSON.stringify(message)}\n`;
};
