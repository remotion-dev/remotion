import type {AnyRemotionOption} from './option';

export const defaultTerminalIds = [
	'terminal',
	'iterm2',
	'ghostty',
	'warp',
	'wezterm',
	'alacritty',
	'windows-terminal',
	'gnome-terminal',
] as const;

export type DefaultTerminal = (typeof defaultTerminalIds)[number];

const cliFlag = 'terminal' as const;
let defaultTerminal: DefaultTerminal | null = null;

const validateDefaultTerminal = (
	value: unknown,
	source: string,
): DefaultTerminal | null => {
	if (value === null) {
		return null;
	}

	if (
		typeof value !== 'string' ||
		!defaultTerminalIds.includes(value as DefaultTerminal)
	) {
		throw new TypeError(
			`${source} must be one of: ${defaultTerminalIds.join(', ')}. Received: ${JSON.stringify(value)}`,
		);
	}

	return value as DefaultTerminal;
};

export const defaultTerminalOption = {
	name: 'Default terminal',
	cliFlag,
	description: () => (
		<>
			Set the default terminal for Remotion Studio. Available terminals:{' '}
			<code>{defaultTerminalIds.join(', ')}</code>.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/config#setdefaultterminal',
	type: null as DefaultTerminal | null,
	getValue: ({commandLine}) => {
		const cliValue = commandLine[cliFlag];
		if (cliValue !== undefined && cliValue !== null) {
			return {
				value: validateDefaultTerminal(cliValue, `--${cliFlag}`),
				source: 'cli',
			};
		}

		return {
			value: defaultTerminal,
			source: 'config',
		};
	},
	setConfig(value) {
		defaultTerminal = validateDefaultTerminal(
			value,
			'Config.setDefaultTerminal()',
		);
	},
	id: cliFlag,
} satisfies AnyRemotionOption<DefaultTerminal | null>;
