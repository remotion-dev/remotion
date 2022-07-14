import {describe, expect, test} from 'vitest';
import {getMediaTime} from '../video/get-current-time';

describe('correctly calculate media time of video element', () => {
	const mp4Precision = 0.04;
	const webmPrecision = 0.02;

	describe('src mp4', () => {
		test('mp4 - Should correctly calculate the media time of a video element', () => {
			expect(
				getMediaTime({
					fps: 30,
					frame: 30,
					playbackRate: 1,
					src: 'video.mp4',
					startFrom: 0,
					mediaType: 'video',
				})
			).toBeCloseTo(1, mp4Precision);
		});

		test('mp4 - Should correctly calculate the media time of a video element with faster framerate', () => {
			expect(
				getMediaTime({
					fps: 30,
					frame: 30,
					playbackRate: 2,
					src: 'video.mp4',
					startFrom: 0,
					mediaType: 'video',
				})
			).toBeCloseTo(2, mp4Precision);
		});

		test('mp4 - Should correctly calculate the media time of a video element with faster framerate and a startFrom', () => {
			// If playbackrate is 2, but the video only starts after 1 second, at 2sec, the video position should be 3sec
			expect(
				getMediaTime({
					fps: 30,
					frame: 60,
					playbackRate: 2,
					src: 'video.mp4',
					startFrom: 30,
					mediaType: 'video',
				})
			).toBeCloseTo(3, mp4Precision);
		});
	});

	describe('src webm', () => {
		test('webm - Should correctly calculate the media time of a video element', () => {
			expect(
				getMediaTime({
					fps: 30,
					frame: 30,
					playbackRate: 1,
					src: 'video.webm',
					startFrom: 0,
					mediaType: 'video',
				})
			).toBeCloseTo(1, webmPrecision);
		});

		test('webm - Should correctly calculate the media time of a video element with faster framerate', () => {
			expect(
				getMediaTime({
					fps: 30,
					frame: 30,
					playbackRate: 2,
					src: 'video.webm',
					startFrom: 0,
					mediaType: 'video',
				})
			).toBeCloseTo(2, webmPrecision);
		});

		test('webm - Should correctly calculate the media time of a video element with faster framerate and a startFrom', () => {
			// If playbackrate is 2, but the video only starts after 1 second, at 2sec, the video position should be 3sec
			expect(
				getMediaTime({
					fps: 30,
					frame: 60,
					playbackRate: 2,
					src: 'video.webm',
					startFrom: 30,
					mediaType: 'video',
				})
			).toBeCloseTo(3, webmPrecision);
		});
	});
});
