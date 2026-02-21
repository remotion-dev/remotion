import type {AnyRemotionOption} from './option';

const cliFlag = 'concurrencies' as const;

let currentConcurrencies: string = '';

export const concurrenciesOption = {
	name: 'Concurrencies',
	cliFlag,
	ssrName: 'concurrencies' as const,
	description: () => (
		<>
			You can specify which concurrency value should be used while rendering the
			video. Multiple concurrency values can be passed separated by comma. Learn
			more about{' '}
			<a href="/docs/terminology/concurrency">
				<code>concurrency</code>
			</a>
		</>
	),
	docLink: 'https://www.remotion.dev/docs/cli/benchmark#--concurrencies',
	type: '' as string,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag]) {
			return {
				value: String(commandLine[cliFlag]),
				source: 'cli',
			};
		}

		if (currentConcurrencies) {
			return {
				value: currentConcurrencies,
				source: 'config',
			};
		}

		return {
			source: 'default',
			value: '',
		};
	},
	setConfig: (value: string) => {
		currentConcurrencies = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<string>;
