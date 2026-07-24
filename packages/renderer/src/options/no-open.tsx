import type {AnyRemotionOption} from './option';

let shouldOpenBrowser = true;

const cliFlag = 'no-open' as const;

export const noOpenOption = {
	name: 'Disable browser auto-open',
	cliFlag,
	description: () => (
		<>
			If specified, Remotion will not open a browser window when starting the
			Studio.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/cli/studio#--no-open',
	type: false as boolean,
	getValue: ({commandLine}) => {
		// Minimist quirk: `--no-open` sets `open` to `false`.
		// When no flag is passed, `open` is `undefined`.
		const cliValue = (commandLine as Record<string, unknown>).open;
		if (cliValue === false) {
			return {value: true, source: 'cli'};
		}

		if (!shouldOpenBrowser) {
			return {value: true, source: 'config'};
		}

		return {value: false, source: 'default'};
	},
	setConfig: (shouldOpen: boolean) => {
		shouldOpenBrowser = shouldOpen;
	},
	reset: () => {
		shouldOpenBrowser = true;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
