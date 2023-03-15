import type {RemotionOption} from './option';

export const audioBitrate: RemotionOption = {
	name: 'Audio Bitrate',
	cliFlag: '--audio-bitrate',
	description: (
		<>
			Specify the target bitrate for the generated video. The syntax for FFMPEGs
			<code>-b:a</code> parameter should be used. FFMPEG may encode the video in
			a way that will not result in the exact audio bitrate specified. Example
			values: <code>512K</code> for 512 kbps, <code>1M</code> for 1 Mbps.
			Default: <code>320k</code>
		</>
	),
	ssrName: 'audioBitrate',
	docLink: 'https://www.remotion.dev/docs/renderer/render-media#audiobitrate-',
};
