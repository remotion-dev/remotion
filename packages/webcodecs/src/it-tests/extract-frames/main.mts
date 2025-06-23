import {extractFrames} from '../../extract-frames';

declare global {
	interface Window {
		videoFrames: number[];
	}
}

window.videoFrames = [];

// @ts-expect-error
await extractFrames({
	src: 'https://parser.media/video.mp4',
	onFrame(frame) {
		window.videoFrames.push(frame.timestamp);
	},
	timestampsInSeconds: [0, 1, 2, 3, 4],
	acknowledgeRemotionLicense: true,
});
