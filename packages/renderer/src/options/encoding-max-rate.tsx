import type {AnyRemotionOption} from './option';

let encodingMaxRate: string | null = null;

const cliFlag = 'max-rate' as const;

export const encodingMaxRateOption = {
	name: 'FFmpeg -maxrate flag',
	cliFlag,
	description: () => (
		<>
			The value for the <code>-maxrate</code> flag of FFmpeg. Should be used in
			conjunction with the encoding buffer size flag. With the VP8, VP9 and AV1
			codecs, a video bitrate must also be set.
		</>
	),
	ssrName: 'encodingMaxRate' as const,
	docLink: 'https://www.remotion.dev/docs/renderer/render-media#maxrate',
	type: '' as string | null,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				value: commandLine[cliFlag] as string,
				source: 'cli',
			};
		}

		if (encodingMaxRate !== null) {
			return {
				value: encodingMaxRate,
				source: 'config',
			};
		}

		return {
			value: null,
			source: 'default',
		};
	},
	setConfig: (newMaxRate: string | null) => {
		encodingMaxRate = newMaxRate;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<string | null>;
