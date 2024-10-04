import {expect, test} from 'bun:test';
import {parseSrt} from '../parse-srt';
import {serializeSrt} from '../serialize-srt';

const input = `
1
00:00:00,000 --> 00:00:02,500
Welcome to the Example Subtitle File!

2
00:00:03,000 --> 00:00:06,000
This is a demonstration of SRT subtitles.

3
00:00:07,000 --> 00:00:10,500
You can use SRT files to add subtitles to your videos.

`.trim();

test('Should create captions', () => {
	const {captions} = parseSrt({input});
	expect(captions).toEqual([
		{
			confidence: 1,
			endMs: 2500,
			startMs: 0,
			text: 'Welcome to the Example Subtitle File!',
			timestampMs: 1250,
		},
		{
			confidence: 1,
			endMs: 6000,
			startMs: 3000,
			text: 'This is a demonstration of SRT subtitles.',
			timestampMs: 4500,
		},
		{
			confidence: 1,
			endMs: 10500,
			startMs: 7000,
			text: 'You can use SRT files to add subtitles to your videos.',
			timestampMs: 8750,
		},
	]);

	const serialized = serializeSrt({lines: captions.map((c) => [c])});
	expect(serialized).toEqual(input);
});
