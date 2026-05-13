// Note: this is a 100% AI slop extension to stream eval progress to stderr.
// If it breaks - safe to remove or fix. It's just a cosmetic thing (live updating logs)

type ExtensionAPI = {
	getFlag: (name: string) => string | undefined;
	on: (
		event: string,
		handler: (event: unknown) => void | Promise<void>,
	) => void;
	registerFlag: (
		name: string,
		options: {
			default: string;
			description: string;
			type: 'string';
		},
	) => void;
};

type StreamOption = 'message' | 'thinking' | 'tools';

type AssistantMessageEvent = {
	delta?: unknown;
	type: string;
};

type ToolEvent = {
	args?: unknown;
	isError?: unknown;
	partialResult?: unknown;
	result?: unknown;
	toolName?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

const getAssistantMessageEvent = (
	event: unknown,
): AssistantMessageEvent | null => {
	if (!isRecord(event)) {
		return null;
	}

	const {assistantMessageEvent} = event;
	if (
		!isRecord(assistantMessageEvent) ||
		typeof assistantMessageEvent.type !== 'string'
	) {
		return null;
	}

	return assistantMessageEvent as AssistantMessageEvent;
};

const getToolEvent = (event: unknown): ToolEvent | null =>
	isRecord(event) ? event : null;

const toText = (value: unknown) =>
	typeof value === 'string' ? value : JSON.stringify(value, null, 2);

const truncate = (value: string, maxLength: number) =>
	value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

const parseJsonOrText = (value: string): unknown => {
	try {
		return JSON.parse(value);
	} catch {
		return value;
	}
};

const parseArgs = (args: unknown): Record<string, unknown> | null => {
	if (!args) {
		return null;
	}

	if (typeof args === 'string') {
		try {
			const parsed = JSON.parse(args);

			return isRecord(parsed) ? parsed : null;
		} catch {
			return null;
		}
	}

	return isRecord(args) ? args : null;
};

const extractText = (result: unknown): string | null => {
	const value = typeof result === 'string' ? parseJsonOrText(result) : result;

	if (!isRecord(value) || !Array.isArray(value.content)) {
		return typeof value === 'string' ? value : null;
	}

	const texts = value.content
		.filter(
			(item) =>
				isRecord(item) && item.type === 'text' && typeof item.text === 'string',
		)
		.map((item) => item.text);

	return texts.length > 0 ? texts.join('\n') : null;
};

const formatToolArgs = (toolName: string, args: unknown) => {
	const parsed = parseArgs(args);

	if (!parsed) {
		return truncate(toText(args), 500);
	}

	if (toolName === 'bash' && typeof parsed.command === 'string') {
		return `$ ${parsed.command}`;
	}

	if (toolName === 'read' && typeof parsed.path === 'string') {
		return parsed.path;
	}

	if (toolName === 'edit' || toolName === 'write') {
		return typeof parsed.path === 'string'
			? parsed.path
			: truncate(toText(parsed), 500);
	}

	return truncate(
		Object.entries(parsed)
			.map(([key, value]) => `${key}: ${truncate(toText(value), 120)}`)
			.join(', '),
		500,
	);
};

const formatToolResult = (result: unknown) => {
	const text = extractText(result);

	return truncate(text ?? toText(result), 1500);
};

const getStreamOptions = (pi: ExtensionAPI) => {
	const flag = pi.getFlag('eval-stream');

	if (!flag || flag === 'off') {
		return new Set<StreamOption>();
	}

	const parts = flag.split(',').map((part) => part.trim().toLowerCase());

	if (parts.includes('all')) {
		return new Set<StreamOption>(['message', 'thinking', 'tools']);
	}

	const validOptions: StreamOption[] = ['message', 'thinking', 'tools'];

	return new Set(
		parts.filter((part): part is StreamOption =>
			validOptions.includes(part as StreamOption),
		),
	);
};

const writeLog = (message: string) => {
	process.stderr.write(`${message}\n`);
};

export default function evalStreamExtension(pi: ExtensionAPI): void {
	pi.registerFlag('eval-stream', {
		default: 'off',
		description:
			'Stream eval progress to stderr. Comma-separated values: message, thinking, tools, all',
		type: 'string',
	});

	pi.on('message_update', (event) => {
		const options = getStreamOptions(pi);
		const assistantEvent = getAssistantMessageEvent(event);

		if (!assistantEvent) {
			return;
		}

		if (assistantEvent.type === 'thinking_delta' && options.has('thinking')) {
			process.stderr.write(String(assistantEvent.delta ?? ''));
			return;
		}

		if (assistantEvent.type === 'text_delta' && options.has('message')) {
			process.stderr.write(String(assistantEvent.delta ?? ''));
		}
	});

	pi.on('tool_execution_start', (event) => {
		const options = getStreamOptions(pi);
		const toolEvent = getToolEvent(event);

		if (!options.has('tools') || !toolEvent) {
			return;
		}

		const toolName =
			typeof toolEvent.toolName === 'string' ? toolEvent.toolName : 'tool';

		writeLog(`[tool] calling ${toolName}`);
		writeLog(`[tool] args ${formatToolArgs(toolName, toolEvent.args)}`);
	});

	pi.on('tool_execution_update', (event) => {
		const options = getStreamOptions(pi);
		const toolEvent = getToolEvent(event);

		if (!options.has('tools') || !toolEvent?.partialResult) {
			return;
		}

		const toolName =
			typeof toolEvent.toolName === 'string' ? toolEvent.toolName : 'tool';
		const text = extractText(toolEvent.partialResult);
		const size = text
			? `${text.length} chars`
			: `${toText(toolEvent.partialResult).length} chars`;

		writeLog(`[tool] running ${toolName} (${size})`);
	});

	pi.on('tool_execution_end', (event) => {
		const options = getStreamOptions(pi);
		const toolEvent = getToolEvent(event);

		if (!options.has('tools') || !toolEvent) {
			return;
		}

		const toolName =
			typeof toolEvent.toolName === 'string' ? toolEvent.toolName : 'tool';
		const status = toolEvent.isError ? 'error' : 'result';

		writeLog(`[tool] ${status} ${toolName}`);
		writeLog(formatToolResult(toolEvent.result));
	});
}
