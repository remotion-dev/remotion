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

export const customEditorTargetPathPlaceholder = '%TARGET_PATH%' as const;
export const customEditorLineNumberPlaceholder = '%LINE_NUMBER%' as const;
export const customEditorColumnNumberPlaceholder = '%COLUMN_NUMBER%' as const;

export type BuiltInEditor = (typeof defaultEditorIds)[number];

export type CustomEditor = {
	readonly type: 'custom';
	readonly name: string;
	readonly executable: string;
	readonly arguments: readonly string[];
};

export type DefaultEditor = BuiltInEditor | CustomEditor;

const cliFlag = 'editor' as const;
let defaultEditor: DefaultEditor | null = null;

const validateBuiltInEditor = (
	value: unknown,
	source: string,
): BuiltInEditor => {
	if (
		typeof value !== 'string' ||
		!defaultEditorIds.includes(value as BuiltInEditor)
	) {
		throw new TypeError(
			`${source} must be one of: ${defaultEditorIds.join(', ')}. Received: ${JSON.stringify(value)}`,
		);
	}

	return value as BuiltInEditor;
};

const validateCustomEditor = (value: unknown, source: string): CustomEditor => {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		throw new TypeError(
			`${source} must be a built-in editor ID or a custom editor object. Received: ${JSON.stringify(value)}`,
		);
	}

	const editor = value as Partial<CustomEditor>;
	if (editor.type !== 'custom') {
		throw new TypeError(`${source}: Custom editors must have type "custom".`);
	}

	if (typeof editor.name !== 'string' || editor.name.trim() === '') {
		throw new TypeError(`${source}: Custom editor name must not be empty.`);
	}

	if (
		typeof editor.executable !== 'string' ||
		editor.executable.trim() === ''
	) {
		throw new TypeError(
			`${source}: Custom editor executable must not be empty.`,
		);
	}

	if (
		!Array.isArray(editor.arguments) ||
		!editor.arguments.every((argument) => typeof argument === 'string')
	) {
		throw new TypeError(
			`${source}: Custom editor arguments must be an array of strings.`,
		);
	}

	if (
		!editor.arguments.some((argument) =>
			argument.includes(customEditorTargetPathPlaceholder),
		)
	) {
		throw new TypeError(
			`${source}: Custom editor arguments must include ${customEditorTargetPathPlaceholder}.`,
		);
	}

	return editor as CustomEditor;
};

const validateDefaultEditor = (
	value: unknown,
	source: string,
): DefaultEditor | null => {
	if (value === null) {
		return null;
	}

	return typeof value === 'string'
		? validateBuiltInEditor(value, source)
		: validateCustomEditor(value, source);
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
	docLink: 'https://www.remotion.dev/docs/studio/open-in-editor',
	type: null as DefaultEditor | null,
	getValue: ({commandLine}) => {
		const cliValue = commandLine[cliFlag];
		if (cliValue !== undefined && cliValue !== null) {
			return {
				value: validateBuiltInEditor(cliValue, `--${cliFlag}`),
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
