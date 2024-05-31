import type {AnyRemotionOption} from './option';

const cliFlag = 'audio-bitrate' as const;

let audioBitrate: string | null = null;

export const audioBitrateOption = {
	name: 'Audio Bitrate',
	cliFlag,
	description: () => (
		<>
			Specify the target bitrate for the generated video. The syntax for FFmpeg
			{"'"}s <code>-b:a</code> parameter should be used. FFmpeg may encode the
			video in a way that will not result in the exact audio bitrate specified.
			Example values: <code>512K</code> for 512 kbps, <code>1M</code> for 1
			Mbps. Default: <code>320k</code>
		</>
	),
	ssrName: 'audioBitrate',
	docLink: 'https://www.remotion.dev/docs/renderer/render-media#audiobitrate-',
	type: '0' as string,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag]) {
			return {
				value: commandLine[cliFlag] as string,
				source: 'cli',
			};
		}

		if (audioBitrate) {
			return {
				value: audioBitrate,
				source: 'config file',
			};
		}

		return {
			value: null,
			source: 'default',
		};
	},
	setConfig: (value: string | null) => {
		audioBitrate = value;
	},
} satisfies AnyRemotionOption<string | null>;
