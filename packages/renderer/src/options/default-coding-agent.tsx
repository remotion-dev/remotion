import type {AnyRemotionOption} from './option';

export const defaultCodingAgentIds = [
	'codex',
	'cursor',
	'github-copilot',
	'claude-code',
] as const;

export type DefaultCodingAgent = (typeof defaultCodingAgentIds)[number];

const cliFlag = 'coding-agent' as const;
let defaultCodingAgent: DefaultCodingAgent | null = null;

const validateDefaultCodingAgent = (
	value: unknown,
	source: string,
): DefaultCodingAgent | null => {
	if (value === null) {
		return null;
	}

	if (
		typeof value !== 'string' ||
		!defaultCodingAgentIds.includes(value as DefaultCodingAgent)
	) {
		throw new TypeError(
			`${source} must be one of: ${defaultCodingAgentIds.join(', ')}. Received: ${JSON.stringify(value)}`,
		);
	}

	return value as DefaultCodingAgent;
};

export const defaultCodingAgentOption = {
	name: 'Default coding agent',
	cliFlag,
	description: () => (
		<>
			Set the default coding agent for Remotion Studio. Available coding agents:{' '}
			<code>{defaultCodingAgentIds.join(', ')}</code>.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/config#setdefaultcodingagent',
	type: null as DefaultCodingAgent | null,
	getValue: ({commandLine}) => {
		const cliValue = commandLine[cliFlag];
		if (cliValue !== undefined && cliValue !== null) {
			return {
				value: validateDefaultCodingAgent(cliValue, `--${cliFlag}`),
				source: 'cli',
			};
		}

		return {
			value: defaultCodingAgent,
			source: 'config',
		};
	},
	setConfig(value) {
		defaultCodingAgent = validateDefaultCodingAgent(
			value,
			'Config.setDefaultCodingAgent()',
		);
	},
	id: cliFlag,
} satisfies AnyRemotionOption<DefaultCodingAgent | null>;
