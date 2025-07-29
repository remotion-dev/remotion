import {extractFrames} from '../../extract-frames';

declare global {
	interface Window {
		videoFrames: number[];
	}
}

window.videoFrames = [];

// @ts-expect-error
await extractFrames({
	src: 'https://parser.media/framer.mp4',
	onFrame(frame) {
		window.videoFrames.push(frame.timestamp);
	},
	timestampsInSeconds: [11 / 30],
	acknowledgeRemotionLicense: true,
});
