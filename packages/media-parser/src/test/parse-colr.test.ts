import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {getStsdBox} from '../containers/iso-base-media/traversal';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('parse colr', async () => {
	const {structure} = await parseMedia({
		src: exampleVideos.profColrTyp,
		fields: {
			structure: true,
		},
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
	});

	const trak = structure.boxes
		.find((b) => b.type === 'moov-box')
		?.children?.find((t) => t.type === 'trak-box');

	const mdia = getStsdBox(trak!);
	const sample = mdia?.samples[0]!;
	if (sample.type !== 'video') {
		throw new Error('Expected video sample');
	}

	const colrBox = sample.descriptors.find((d) => d.type === 'colr-box')!;
	expect(colrBox).toEqual({
		type: 'colr-box',
		colorType: 'icc-profile',
		profile: new Uint8Array([
			0, 0, 1, 200, 0, 0, 0, 0, 4, 48, 0, 0, 109, 110, 116, 114, 82, 71, 66, 32,
			88, 89, 90, 32, 7, 224, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 97, 99, 115, 112, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 1, 0, 0, 246, 214, 0, 1, 0, 0, 0, 0, 211, 45, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 100, 101, 115,
			99, 0, 0, 0, 240, 0, 0, 0, 36, 114, 88, 89, 90, 0, 0, 1, 20, 0, 0, 0, 20,
			103, 88, 89, 90, 0, 0, 1, 40, 0, 0, 0, 20, 98, 88, 89, 90, 0, 0, 1, 60, 0,
			0, 0, 20, 119, 116, 112, 116, 0, 0, 1, 80, 0, 0, 0, 20, 114, 84, 82, 67,
			0, 0, 1, 100, 0, 0, 0, 40, 103, 84, 82, 67, 0, 0, 1, 100, 0, 0, 0, 40, 98,
			84, 82, 67, 0, 0, 1, 100, 0, 0, 0, 40, 99, 112, 114, 116, 0, 0, 1, 140, 0,
			0, 0, 60, 109, 108, 117, 99, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 12, 101,
			110, 85, 83, 0, 0, 0, 8, 0, 0, 0, 28, 0, 115, 0, 82, 0, 71, 0, 66, 88, 89,
			90, 32, 0, 0, 0, 0, 0, 0, 111, 162, 0, 0, 56, 245, 0, 0, 3, 144, 88, 89,
			90, 32, 0, 0, 0, 0, 0, 0, 98, 153, 0, 0, 183, 133, 0, 0, 24, 218, 88, 89,
			90, 32, 0, 0, 0, 0, 0, 0, 36, 160, 0, 0, 15, 132, 0, 0, 182, 207, 88, 89,
			90, 32, 0, 0, 0, 0, 0, 0, 246, 214, 0, 1, 0, 0, 0, 0, 211, 45, 112, 97,
			114, 97, 0, 0, 0, 0, 0, 4, 0, 0, 0, 2, 102, 102, 0, 0, 242, 167, 0, 0, 13,
			89, 0, 0, 19, 208, 0, 0, 10, 91, 0, 0, 0, 0, 0, 0, 0, 0, 109, 108, 117,
			99, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 12, 101, 110, 85, 83, 0, 0, 0, 32, 0,
			0, 0, 28, 0, 71, 0, 111, 0, 111, 0, 103, 0, 108, 0, 101, 0, 32, 0, 73, 0,
			110, 0, 99, 0, 46, 0, 32, 0, 50, 0, 48, 0, 49, 0, 54,
		]),
		parsed: {
			bXYZ: {
				x: 0,
				y: 0.14306640625,
				z: 0.06060791015625,
			},
			colorSpace: 'RGB',
			dateTime: new Uint8Array([7, 224, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0]),
			deviceAttributes: BigInt(0),
			deviceManufacturer: '\u0000\u0000\u0000\u0000',
			deviceModel: '\u0000\u0000\u0000\u0000',
			entries: [
				{
					offset: 240,
					size: 36,
					tag: 'desc',
				},
				{
					offset: 276,
					size: 20,
					tag: 'rXYZ',
				},
				{
					offset: 296,
					size: 20,
					tag: 'gXYZ',
				},
				{
					offset: 316,
					size: 20,
					tag: 'bXYZ',
				},
				{
					offset: 336,
					size: 20,
					tag: 'wtpt',
				},
				{
					offset: 356,
					size: 40,
					tag: 'rTRC',
				},
				{
					offset: 356,
					size: 40,
					tag: 'gTRC',
				},
				{
					offset: 356,
					size: 40,
					tag: 'bTRC',
				},
				{
					offset: 396,
					size: 60,
					tag: 'cprt',
				},
			],
			gXYZ: {
				x: 0,
				y: 0.3851470947265625,
				z: 0.7168731689453125,
			},
			pcs: 'XYZ',
			pcsIlluminant: [0.964202880859375, 1, 0.8249053955078125],
			preferredCMMType: '\u0000\u0000\u0000\u0000',
			primaryPlatform: '\u0000\u0000\u0000\u0000',
			profileCreator: '\u0000\u0000\u0000\u0000',
			profileDeviceClass: 'mntr',
			profileFlags: 0,
			profileId:
				'\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000',
			profileVersion: '\u00040\u0000\u0000',
			rXYZ: {
				x: 0,
				y: 0.436065673828125,
				z: 0.2224884033203125,
			},
			renderingIntent: 1,
			signature: 'acsp',
			size: 456,
			whitePoint: {
				x: 0,
				y: 0.964202880859375,
				z: 1,
			},
		},
	});
});
