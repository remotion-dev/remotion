import type {AnyRemotionOption} from './option';

export const doubleClickActions = [
	{value: 'open-in-editor', label: 'Open in editor'},
	{value: 'open-in-agent', label: 'Open in coding agent'},
	{value: 'copy-context', label: 'Copy context for agents'},
] as const;

export type DoubleClickAction = (typeof doubleClickActions)[number]['value'];

const cliFlag = 'double-click-action' as const;
let configuredAction: DoubleClickAction | null = null;

const parseDoubleClickAction = (value: unknown, source: string) => {
	const action = doubleClickActions.find((choice) => choice.value === value);
	if (!action) {
		throw new TypeError(
			`${source} expects one of ${doubleClickActions.map((choice) => choice.value).join(', ')}. Received ${JSON.stringify(value)}.`,
		);
	}

	return action.value;
};

export const doubleClickActionOption = {
	name: 'Double-click action',
	addedIn: '4.0.546',
	cliFlag,
	id: cliFlag,
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/options/double-click-action',
	description: () => (
		<>
			Choose what happens when double-clicking a layer, effect, or property in
			Remotion Studio. <code>open-in-editor</code> (default) opens its source
			code. <code>open-in-agent</code> opens the preferred coding agent.{' '}
			<code>copy-context</code> copies the item name, file path, and line number
			to the clipboard. Change the project setting in Settings → Apps.
		</>
	),
	type: 'open-in-editor' as DoubleClickAction,
	getValue: ({commandLine}) => {
		const value = commandLine[cliFlag];
		if (value !== undefined && value !== null) {
			return {
				value: parseDoubleClickAction(value, `--${cliFlag}`),
				source: 'cli' as const,
			};
		}

		return {
			value: configuredAction ?? 'open-in-editor',
			source: 'config' as const,
		};
	},
	setConfig(value) {
		configuredAction = parseDoubleClickAction(
			value,
			'Config.setDoubleClickAction()',
		);
	},
	getConfigValue: () => configuredAction,
	reset: () => {
		configuredAction = null;
	},
} satisfies AnyRemotionOption<DoubleClickAction>;
