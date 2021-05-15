import {getMediaTime} from '../video/get-current-time';

test('Should correctly calculate the media time of a video element', () => {
	expect(
		getMediaTime({
			fps: 30,
			frame: 30,
			playbackRate: 1,
			src: 'video.mp4',
		})
	).toBe(1);
});
