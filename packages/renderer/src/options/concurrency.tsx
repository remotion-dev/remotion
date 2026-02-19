import type {AnyRemotionOption} from './option';

export type Concurrency = number | string | null;

let currentConcurrency: Concurrency = null;

const cliFlag = 'concurrency' as const;

export const concurrencyOption = {
	name: 'Concurrency',
	cliFlag,
	description: () => (
		<>
			How many CPU threads to use. Minimum 1. The maximum is the amount of
			threads you have (In Node.JS <code>os.cpus().length</code>). You can also
			provide a percentage value (e.g. <code>50%</code>).
		</>
	),
	ssrName: 'concurrency' as const,
	docLink: 'https://www.remotion.dev/docs/config#setconcurrency',
	type: null as Concurrency,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as Concurrency,
			};
		}

		if (currentConcurrency !== null) {
			return {
				source: 'config',
				value: currentConcurrency,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: (value) => {
		currentConcurrency = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<Concurrency>;
