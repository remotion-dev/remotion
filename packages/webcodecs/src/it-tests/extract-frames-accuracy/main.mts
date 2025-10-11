import {extractFrames} from '../../extract-frames';

declare global {
	interface Window {
		videoFrames: number[];
		done: boolean;
		errors: Error[];
	}
}

window.videoFrames = [];
window.done = false;
window.errors = [];

extractFrames({
	src: 'https://remotion.media/framer.mp4',
	onFrame(frame) {
		window.videoFrames.push(frame.timestamp);
	},
	logLevel: 'verbose',
	timestampsInSeconds: [11 / 30],
	acknowledgeRemotionLicense: true,
})
	.catch((err) => {
		window.errors.push(err);
		console.error(err);
	})
	.finally(() => {
		window.done = true;
	});
