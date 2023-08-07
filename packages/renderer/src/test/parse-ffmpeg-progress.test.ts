import {expect, test} from 'vitest';
import {parseFfmpegProgress} from '../parse-ffmpeg-progress';

test('Should be able to parse FFMPEG progress', () => {
	const result = parseFfmpegProgress('anything');
	expect(result).toBe(undefined);
	expect(
		parseFfmpegProgress(
			'frame=   34 fps=5.7 q=0.0 size=       0kB time=00:00:00.15 bitrate=  27.0kbits/s speed=0.0253x'
		)
	).toBe(34);
});
test('Should be able to parse 5 digits progress', () => {
	expect(
		parseFfmpegProgress(
			'frame=10234 fps=5.7 q=0.0 size=       0kB time=00:00:00.15 bitrate=  27.0kbits/s speed=0.0253x'
		)
	).toBe(10234);
});

test('another failure', () => {
	expect(
		parseFfmpegProgress(
			'frame= 3188 fps=104 q=-1.0 size=   11776kB time=00:01:46.19 bitrate= 908.4kbits/s speed=3.46x'
		)
	).toBe(3188);
});
