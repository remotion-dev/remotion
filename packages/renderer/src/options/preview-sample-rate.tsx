import type {AnyRemotionOption} from './option';

const cliFlag = 'preview-sample-rate' as const;

let currentPreviewSampleRate: number | null = null;

export const previewSampleRateOption = {
	name: 'Preview Sample Rate',
	cliFlag,
	description: () => (
		<>
			Controls the sample rate used for audio playback during preview. When
			unset, Remotion uses <code>48000</code> Hz.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/config#setpreviewsamplerate',
	type: null as number | null,
	getValue: ({commandLine}: {commandLine: Record<string, unknown>}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {value: commandLine[cliFlag] as number, source: 'cli'};
		}

		if (currentPreviewSampleRate !== null) {
			return {value: currentPreviewSampleRate, source: 'config file'};
		}

		return {value: null, source: 'default'};
	},
	setConfig: (value: number | null) => {
		currentPreviewSampleRate = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<number | null>;
