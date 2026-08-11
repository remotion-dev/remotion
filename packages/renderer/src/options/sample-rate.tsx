import type {AnyRemotionOption} from './option';

const cliFlag = 'sample-rate' as const;

let currentSampleRate: number = 48000;

export const sampleRateOption = {
	name: 'Sample Rate',
	cliFlag,
	description: () => (
		<>
			Controls the sample rate of the output audio. The default is{' '}
			<code>48000</code> Hz. Match this to your source audio to avoid resampling
			artifacts.
		</>
	),
	ssrName: 'sampleRate' as const,
	docLink: 'https://www.remotion.dev/docs/sample-rate',
	type: 48000 as number,
	getValue: (
		{commandLine}: {commandLine: Record<string, unknown>},
		compositionSampleRate?: number | null,
	) => {
		if (commandLine[cliFlag] !== undefined) {
			return {value: commandLine[cliFlag] as number, source: 'cli'};
		}

		if (currentSampleRate !== 48000) {
			return {value: currentSampleRate, source: 'config file'};
		}

		if (compositionSampleRate) {
			return {
				value: compositionSampleRate,
				source: 'via calculateMetadata',
			};
		}

		return {value: 48000, source: 'default'};
	},
	setConfig: (value: number) => {
		currentSampleRate = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<number>;
