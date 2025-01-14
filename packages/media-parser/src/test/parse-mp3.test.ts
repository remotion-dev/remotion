import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('should read MP3 file', async () => {
	let samples = 0;
	const {tracks} = await parseMedia({
		src: exampleVideos.music,
		reader: nodeReader,
		fields: {
			tracks: true,
		},
		onAudioTrack: () => {
			return () => {
				samples++;
			};
		},
	});

	expect(samples).toBe(4788);
	console.log(tracks);
});

test.todo('should read only header');
test.todo('should read only metadata');
test.todo('should read ID3 tags');
test.todo('should read duration');
test.todo('should get video track');
