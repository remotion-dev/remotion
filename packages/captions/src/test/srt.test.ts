import {expect, test} from 'bun:test';
import {parseSrt} from '../parse-srt';

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

4
00:00:12,000 --> 00:00:15,000
Each subtitle entry consists of a number, a timecode,
and the subtitle text.

5
00:00:16,000 --> 00:00:20,000
The timecode format is hours:minutes:seconds,milliseconds.

6
00:00:21,000 --> 00:00:25,000
You can adjust the timing to match your video.

7
00:00:26,000 --> 00:00:30,000
Make sure the subtitle text is clear and readable.

8
00:00:31,000 --> 00:00:35,000
And that's how you create an SRT subtitle file!

9
00:00:36,000 --> 00:00:40,000
Enjoy adding subtitles to your videos!
`.trim();

test('Should create captions', () => {
	const {lines} = parseSrt({input});
	expect(lines).toEqual([
		{
			endInSeconds: 2.5,
			index: 1,
			startInSeconds: 0,
			text: 'Welcome to the Example Subtitle File!',
		},
		{
			endInSeconds: 6,
			index: 2,
			startInSeconds: 3,
			text: 'This is a demonstration of SRT subtitles.',
		},
		{
			endInSeconds: 10.5,
			index: 3,
			startInSeconds: 7,
			text: 'You can use SRT files to add subtitles to your videos.',
		},
		{
			endInSeconds: 15,
			index: 4,
			startInSeconds: 12,
			text: 'Each subtitle entry consists of a number, a timecode,\nand the subtitle text.',
		},
		{
			endInSeconds: 20,
			index: 5,
			startInSeconds: 16,
			text: 'The timecode format is hours:minutes:seconds,milliseconds.',
		},
		{
			endInSeconds: 25,
			index: 6,
			startInSeconds: 21,
			text: 'You can adjust the timing to match your video.',
		},
		{
			endInSeconds: 30,
			index: 7,
			startInSeconds: 26,
			text: 'Make sure the subtitle text is clear and readable.',
		},
		{
			endInSeconds: 35,
			index: 8,
			startInSeconds: 31,
			text: "And that's how you create an SRT subtitle file!",
		},
		{
			endInSeconds: 40,
			index: 9,
			startInSeconds: 36,
			text: 'Enjoy adding subtitles to your videos!\n',
		},
	]);
});
