import {extractFrames} from '../../extract-frames';

declare global {
	interface Window {
		videoFrames: number[];
		done: boolean;
		errors: Error[];
	}
}

window.done = false;
window.videoFrames = [];
window.errors = [];

extractFrames({
	src: 'https://remotion.media/video.mp4',
	onFrame(frame) {
		window.videoFrames.push(frame.timestamp);
	},
	timestampsInSeconds: [0, 1, 2, 3, 4],
	acknowledgeRemotionLicense: true,
})
	.catch((err) => {
		window.errors.push(err);
		console.error(err);
	})
	.finally(() => {
		window.done = true;
	});
