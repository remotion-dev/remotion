import type {AnyRemotionOption} from './option';

let videoBitrate: string | null = null;

const cliFlag = 'video-bitrate' as const;

export const videoBitrateOption = {
	name: 'Video Bitrate',
	cliFlag,
	description: () => (
		<>
			Specify the target bitrate for the generated video. The syntax for FFmpeg
			{"'"}s<code>-b:v</code> parameter should be used. FFmpeg may encode the
			video in a way that will not result in the exact video bitrate specified.
			Example values: <code>512K</code> for 512 kbps, <code>1M</code> for 1
			Mbps.
		</>
	),
	ssrName: 'videoBitrate',
	docLink: 'https://www.remotion.dev/docs/renderer/render-media#videobitrate-',
	type: '' as string | null,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as string | null,
			};
		}

		if (videoBitrate !== null) {
			return {
				source: 'config',
				value: videoBitrate,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: (bitrate: string | null) => {
		videoBitrate = bitrate;
	},
} satisfies AnyRemotionOption<string | null>;
