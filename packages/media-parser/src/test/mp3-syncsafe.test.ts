import {test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('should respect syncsafe tag sizes', async () => {
	await parseMedia({
		src: '/Users/jonathanburger/Downloads/silence-with-artwork.mp3',
		reader: nodeReader,
		fields: {
			durationInSeconds: true,
		},
		acknowledgeRemotionLicense: true,
	});
});
