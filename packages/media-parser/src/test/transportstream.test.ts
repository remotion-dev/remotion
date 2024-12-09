import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('Transport stream', async () => {
	const {structure} = await parseMedia({
		src: exampleVideos.transportstream,
		fields: {
			durationInSeconds: true,
			structure: true,
		},
		reader: nodeReader,
	});
	expect(structure.boxes[0]).toEqual({
		type: 'transport-stream-pat-box',
		tableId: '0',
		pat: [
			{
				type: 'transport-stream-program-association-table',
				programNumber: 1,
				programMapIdentifier: 4096,
			},
		],
	});
	expect(structure.boxes[1]).toEqual({
		type: 'transport-stream-pmt-box',
		tableId: 2,
		streams: [
			{
				pid: 256,
				streamType: 27,
			},
			{
				pid: 257,
				streamType: 15,
			},
		],
	});
	const fs = await import('fs');
	fs.writeFileSync('transportstream.json', JSON.stringify(structure, null, 2));
});
