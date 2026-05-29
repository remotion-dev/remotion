import type {AnyRemotionOption} from './option';
import {sampleRateOption} from './sample-rate';

const cliFlag = 'preview-sample-rate' as const;

let currentPreviewSampleRate: number | null = null;

export const previewSampleRateOption = {
	name: 'Preview Sample Rate',
	cliFlag,
	description: () => (
		<>
			Controls the sample rate used for audio playback during preview. By
			default, Remotion uses the render sample rate configuration.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/config#setpreviewsamplerate',
	type: 48000 as number,
	getValue: ({commandLine}: {commandLine: Record<string, unknown>}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {value: commandLine[cliFlag] as number, source: 'cli'};
		}

		if (currentPreviewSampleRate !== null) {
			return {value: currentPreviewSampleRate, source: 'config file'};
		}

		const fallback = sampleRateOption.getValue({commandLine});
		return {value: fallback.value, source: fallback.source};
	},
	setConfig: (value: number) => {
		currentPreviewSampleRate = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<number>;
