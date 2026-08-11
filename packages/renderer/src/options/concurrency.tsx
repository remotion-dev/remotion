import type {AnyRemotionOption} from './option';

export type Concurrency = number | string | null;

let currentConcurrency: Concurrency = null;

const cliFlag = 'concurrency' as const;

// Browser-safe validation that does not pull in Node.js modules
// (validate-concurrency.ts imports node:child_process via get-cpu-count.ts)
const validateConcurrencyValue = (value: unknown, setting: string) => {
	if (typeof value === 'undefined' || value === null) {
		return;
	}

	if (typeof value !== 'number' && typeof value !== 'string') {
		throw new Error(setting + ' must a number or a string but is ' + value);
	}

	if (typeof value === 'number') {
		if (value % 1 !== 0) {
			throw new Error(setting + ' must be an integer, but is ' + value);
		}
	} else if (!/^\d+(\.\d+)?%$/.test(value)) {
		throw new Error(
			`${setting} must be a number or percentage, but is ${JSON.stringify(
				value,
			)}`,
		);
	}
};

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
			const value = commandLine[cliFlag] as Concurrency;
			validateConcurrencyValue(value, 'concurrency');

			return {
				source: 'cli',
				value,
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
		validateConcurrencyValue(value, 'Config.setConcurrency');

		currentConcurrency = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<Concurrency>;
