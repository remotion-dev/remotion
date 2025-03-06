import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {getSeekingByte} from '../get-seeking-info';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

test('getSeekingInfo', async () => {
	const result = await parseMedia({
		src: exampleVideos.bigBuckBunny,
		fields: {
			seekingInfo: true,
		},
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
	});

	if (!result.seekingInfo) {
		throw new Error('No seeking info');
	}

	const byte = getSeekingByte(result.seekingInfo, 17);

	expect(byte).toBe(3853565);
});
