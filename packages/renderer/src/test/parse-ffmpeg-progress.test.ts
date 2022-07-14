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
