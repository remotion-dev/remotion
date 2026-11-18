import type {AnyRemotionOption} from './option';

let configuredShowDiagnostics: boolean | null = null;

const cliFlag = 'show-diagnostics' as const;

export const showDiagnosticsOption = {
	name: 'Show Studio diagnostics',
	addedIn: '4.0.543',
	cliFlag,
	id: cliFlag,
	description: () => (
		<>
			Show a movable diagnostics window in the Studio with the number of audio
			iterators created, open Mediabunny sinks, buffering handles created, and
			buffering states triggered. Creation counts reset when the page reloads.
			The buffering handle count can also be reset in the window. While open,
			the window records buffering events with their contributing handles and
			lets you reveal the owning layers in the timeline. Setting this option on
			the command line disables the corresponding Studio settings switch.
			Defaults to <code>false</code>.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/options/show-diagnostics',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined && commandLine[cliFlag] !== null) {
			return {value: commandLine[cliFlag] as boolean, source: 'cli' as const};
		}

		return {
			value: configuredShowDiagnostics ?? false,
			source: 'config' as const,
		};
	},
	setConfig(value) {
		if (typeof value !== 'boolean') {
			throw new Error('Config.setShowDiagnostics() expects a boolean');
		}

		configuredShowDiagnostics = value;
	},
	getConfigValue: () => configuredShowDiagnostics,
	reset: () => {
		configuredShowDiagnostics = null;
	},
} satisfies AnyRemotionOption<boolean>;
