import type {AnyRemotionOption} from './option';

const DEFAULT_RUNS = 3;

let currentRuns: number = DEFAULT_RUNS;

const cliFlag = 'runs' as const;

export const runsOption = {
	name: 'Benchmark runs',
	cliFlag,
	description: () => (
		<>
			Specify how many times the video should be rendered during a benchmark.
			Default <code>{DEFAULT_RUNS}</code>.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/cli/benchmark#--runs',
	type: DEFAULT_RUNS as number,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			const value = Number(commandLine[cliFlag]);
			if (isNaN(value) || value < 1) {
				throw new Error(
					`--runs must be a positive number, but got ${commandLine[cliFlag]}`,
				);
			}

			return {value, source: 'cli'};
		}

		if (currentRuns !== DEFAULT_RUNS) {
			return {value: currentRuns, source: 'config'};
		}

		return {value: DEFAULT_RUNS, source: 'default'};
	},
	setConfig: (value: number) => {
		if (typeof value !== 'number' || isNaN(value) || value < 1) {
			throw new Error(`Runs must be a positive number, but got ${value}`);
		}

		currentRuns = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<number>;
