import {extractFrames} from '../../extract-frames';

const frames: VideoFrame[] = [];

console.log('extractFrames');
await extractFrames({
	src: 'https://parser.media/video.mp4',
	onFrame(frame) {
		frames.push(frame);
	},
	timestampsInSeconds: [0, 1, 2, 3, 4],
	acknowledgeRemotionLicense: true,
});

window.videoFrames = frames;
console.log(window.videoFrames);
