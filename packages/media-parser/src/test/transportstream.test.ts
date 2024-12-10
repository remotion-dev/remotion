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
		onVideoTrack: (track) => {
			expect(track).toEqual({
				rotation: 0,
				trackId: 256,
				type: 'video',
				timescale: 90000,
				codec: 'avc1.640020',
				codecPrivate: new Uint8Array([
					1, 32, 0, 100, 255, 225, 0, 27, 100, 0, 32, 172, 217, 0, 180, 22, 236,
					5, 168, 72, 144, 74, 0, 0, 3, 0, 2, 168, 58, 104, 0, 30, 48, 99, 44,
					1, 0, 5, 104, 234, 236, 178, 44,
				]),
				fps: null,
				codedWidth: 720,
				codedHeight: 720,
				height: 720,
				width: 720,
				displayAspectWidth: 720,
				displayAspectHeight: 720,
				trakBox: null,
				codecWithoutConfig: 'h264',
				description: new Uint8Array([
					1, 32, 0, 100, 255, 225, 0, 27, 100, 0, 32, 172, 217, 0, 180, 22, 236,
					5, 168, 72, 144, 74, 0, 0, 3, 0, 2, 168, 58, 104, 0, 30, 48, 99, 44,
					1, 0, 5, 104, 234, 236, 178, 44,
				]),
				sampleAspectRatio: {
					denominator: 1,
					numerator: 1,
				},
				color: {
					matrixCoefficients: 'bt2020',
					transferCharacteristics: 'arib-std-b67',
					primaries: 'bt2020',
					fullRange: false,
				},
			});
			return null;
		},
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
