import type {AnyRemotionOption} from './option';

export const defaultEditorIds = [
	'vscode',
	'cursor',
	'windsurf',
	'zed',
	'vscodium',
	'webstorm',
	'sublime-text',
] as const;

export type DefaultEditor = (typeof defaultEditorIds)[number];

const cliFlag = 'editor' as const;
let defaultEditor: DefaultEditor | null = null;

const validateDefaultEditor = (
	value: unknown,
	source: string,
): DefaultEditor | null => {
	if (value === null) {
		return null;
	}

	if (
		typeof value !== 'string' ||
		!defaultEditorIds.includes(value as DefaultEditor)
	) {
		throw new TypeError(
			`${source} must be one of: ${defaultEditorIds.join(', ')}. Received: ${JSON.stringify(value)}`,
		);
	}

	return value as DefaultEditor;
};

export const defaultEditorOption = {
	name: 'Default editor',
	cliFlag,
	description: () => (
		<>
			Set the default editor for opening files from Remotion Studio. Available
			editors: <code>{defaultEditorIds.join(', ')}</code>.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/config#setdefaulteditor',
	type: null as DefaultEditor | null,
	getValue: ({commandLine}) => {
		const cliValue = commandLine[cliFlag];
		if (cliValue !== undefined && cliValue !== null) {
			return {
				value: validateDefaultEditor(cliValue, `--${cliFlag}`),
				source: 'cli',
			};
		}

		return {
			value: defaultEditor,
			source: 'config',
		};
	},
	setConfig(value) {
		defaultEditor = validateDefaultEditor(value, 'Config.setDefaultEditor()');
	},
	id: cliFlag,
} satisfies AnyRemotionOption<DefaultEditor | null>;
