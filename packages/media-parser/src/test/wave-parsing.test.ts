import {test} from 'bun:test';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

test('wave parsinv', async () => {
	await parseMedia({
		src: '/Users/jonathanburger/Downloads/Indie_Hacker_Podcast (2).wav',
		acknowledgeRemotionLicense: true,
		fields: {
			tracks: true,
		},
		reader: nodeReader,
	});
});
