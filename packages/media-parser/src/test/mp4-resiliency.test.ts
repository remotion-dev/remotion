import {exampleVideos} from '@remotion/example-videos';
import {test} from 'bun:test';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

test('handle garbage atom at of file', async () => {
	await parseMedia({
		src: exampleVideos.garbageAtEnd,
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
		onVideoTrack: () => {
			return () => {};
		},
	});
});

test('handle subsequent mdat atoms', async () => {
	await parseMedia({
		src: exampleVideos.subsequentMdat,
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
		onVideoTrack: () => {
			return () => {};
		},
	});
});
