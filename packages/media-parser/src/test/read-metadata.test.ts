import {exampleVideos} from '@remotion/example-videos';
import {test} from 'bun:test';
import {getMoovBox} from '../boxes/iso-base-media/traversal';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('iPhone metadata', async () => {
	const {structure} = await parseMedia({
		src: exampleVideos.iphonelivefoto,
		fields: {
			structure: true,
		},
		reader: nodeReader,
	});

	const fs = await import('fs');
	fs.writeFileSync('structure.json', JSON.stringify(structure, null, 2));
	if (structure.type !== 'iso-base-media') {
		throw new Error('Expected video');
	}

	const moov = getMoovBox(structure.boxes);
	const meta = moov?.children.find(
		(b) => b.type === 'regular-box' && b.boxType === 'meta',
	);
	console.log(meta);
});
