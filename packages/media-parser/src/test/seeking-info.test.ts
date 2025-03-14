import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {getSeekingByte} from '../get-seeking-info';
import {mediaParserController} from '../media-parser-controller';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

test('getSeekingInfo', async () => {
	const controller = mediaParserController();
	let samples = 0;

	const result = await parseMedia({
		src: exampleVideos.bigBuckBunny,
		fields: {
			seekingInfo: true,
		},
		controller,
		reader: nodeReader,
		onVideoTrack: () => {
			controller.seek({
				type: 'time-in-seconds',
				time: 10,
			});
			return () => {
				samples++;
			};
		},
		acknowledgeRemotionLicense: true,
	});

	expect(samples).toBe(1440);

	if (!result.seekingInfo) {
		throw new Error('No seeking info');
	}

	const byte = getSeekingByte(result.seekingInfo, 17);

	expect(byte).toBe(3853565);
});
