import type {AnyRemotionOption} from './option';

let currentConcurrencies: string | null = null;

const cliFlag = 'concurrencies' as const;

export const benchmarkConcurrenciesOption = {
	name: 'Benchmark concurrencies',
	cliFlag,
	description: () => (
		<>
			Specify which concurrency values should be used while benchmarking.
			Multiple values can be passed separated by comma. Learn more about{' '}
			<a href="https://remotion.dev/docs/terminology/concurrency">
				concurrency
			</a>
			.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/cli/benchmark#--concurrencies',
	type: null as string | null,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {value: commandLine[cliFlag] as string, source: 'cli'};
		}

		if (currentConcurrencies !== null) {
			return {value: currentConcurrencies, source: 'config'};
		}

		return {value: null, source: 'default'};
	},
	setConfig: (value: string | null) => {
		currentConcurrencies = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<string | null>;
