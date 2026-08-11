import type {AnyRemotionOption} from './option';

const cliFlag = 'port' as const;

let currentPort: number | null = null;

export const portOption = {
	name: 'Port',
	cliFlag,
	description: () => (
		<>
			Set a custom HTTP server port for the Studio or the render process. If not
			defined, Remotion will try to find a free port.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/config#setstudioport',
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as number,
			};
		}

		if (currentPort !== null) {
			return {
				source: 'config',
				value: currentPort,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: (value: number | null) => {
		currentPort = value;
	},
	type: 0 as number | null,
	id: cliFlag,
} satisfies AnyRemotionOption<number | null>;
