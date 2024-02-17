import type {AnyRemotionOption} from './option';

export const videoBitrate = {
	name: 'Video Bitrate',
	cliFlag: 'video-bitrate',
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
} satisfies AnyRemotionOption<string | null>;
