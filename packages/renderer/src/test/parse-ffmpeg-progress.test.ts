import {expect, test} from 'bun:test';
import {parseFfmpegProgress} from '../parse-ffmpeg-progress';

test('Should be able to parse Ffmpeg progress', () => {
	const result = parseFfmpegProgress('anything', 30);
	// @ts-expect-error bun types bug
	expect(result).toBe(undefined);
	expect(
		parseFfmpegProgress(
			'frame=   34 fps=5.7 q=0.0 size=       0kB time=00:00:00.15 bitrate=  27.0kbits/s speed=0.0253x',
			30,
		),
	).toBe(34);
});
test('Should be able to parse 5 digits progress', () => {
	expect(
		parseFfmpegProgress(
			'frame=10234 fps=5.7 q=0.0 size=       0kB time=00:00:00.15 bitrate=  27.0kbits/s speed=0.0253x',
			30,
		),
	).toBe(10234);
});

test('another failure', () => {
	expect(
		parseFfmpegProgress(
			'frame= 3188 fps=104 q=-1.0 size=   11776kB time=00:01:46.19 bitrate= 908.4kbits/s speed=3.46x',
			30,
		),
	).toBe(3188);
});

test('New "time" output', () => {
	expect(
		parseFfmpegProgress(
			'size= 130048kB time=00:02:37.70 bitrate=6755.6kbits/s speed=7.14x',
			30,
		),
	).toBe(4731);
});
