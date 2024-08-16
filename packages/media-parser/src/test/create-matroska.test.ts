import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {makeMatroskaHeader} from '../boxes/webm/make-header';

test('Should make Matroska header that is same as input', async () => {
	const exampleVideo = RenderInternals.exampleVideos.matroskaMp3;
	const file = await Bun.file(exampleVideo).arrayBuffer();

	const headerInput = new Uint8Array(file.slice(0, 0x23 + 5));

	const headerOutput = makeMatroskaHeader();

	expect(headerInput).toEqual(headerOutput);
});
