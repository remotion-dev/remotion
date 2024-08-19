import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {makeMatroskaHeader} from '../boxes/webm/make-header';
import {matroskaHeader, seekId} from '../boxes/webm/segments/all-segments';

test('Should make Matroska header that is same as input', async () => {
	const exampleVideo = RenderInternals.exampleVideos.matroskaMp3;
	const file = await Bun.file(exampleVideo).arrayBuffer();

	const headerInput = new Uint8Array(file.slice(0, 0x28));

	const headerOutput = makeMatroskaHeader(matroskaHeader, {
		DocType: 'matroska',
		DocTypeVersion: 4,
		DocTypeReadVersion: 2,
		EBMLMaxIDLength: 4,
		EBMLMaxSizeLength: 8,
		EBMLReadVersion: 1,
		EBMLVersion: 1,
	});

	expect(headerInput).toEqual(headerOutput);
});

test('Should be able to create SeekIdBox', async () => {
	const file = new Uint8Array(
		await Bun.file('vp8-segments/56-0x53ab').arrayBuffer(),
	);

	const custom = makeMatroskaHeader(seekId, '0x1549A966');
	expect(custom).toEqual(file);
});
