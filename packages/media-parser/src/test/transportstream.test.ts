import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('Transport stream', async () => {
	let audioSamples = 0;
	let videoSamples = 0;

	const {
		structure,
		durationInSeconds,
		dimensions,
		container,
		audioCodec,
		fps,
		isHdr,
		videoCodec,
	} = await parseMedia({
		src: exampleVideos.transportstream,
		fields: {
			durationInSeconds: true,
			structure: true,
			dimensions: true,
			container: true,
			audioCodec: true,
			fps: true,
			videoCodec: true,
			isHdr: true,
		},
		reader: nodeReader,
		onAudioTrack: (track) => {
			expect(track).toEqual({
				type: 'audio',
				codecPrivate: new Uint8Array([9, 144]),
				trackId: 257,
				trakBox: null,
				timescale: 48000,
				codecWithoutConfig: 'aac',
				codec: 'mp4a.40.2',
				description: undefined,
				numberOfChannels: 2,
				sampleRate: 48000,
			});
			return () => {
				audioSamples++;
			};
		},
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
				description: undefined,
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
			return (sample) => {
				if (videoSamples === 0) {
					expect(sample.data.byteLength).toBe(23813);
				}

				expect(sample.data[0]).toBe(0);
				expect(sample.data[1]).toBe(0);
				expect(sample.data[2]).toBe(1);
				expect(sample.data[3]).toBe(0x9);

				videoSamples++;
			};
		},
	});
	expect(container).toBe('transport-stream');
	expect(durationInSeconds).toBe(null);
	expect(dimensions).toEqual({
		height: 720,
		width: 720,
	});
	expect(audioSamples).toBe(24);
	expect(audioCodec).toBe('aac');
	expect(fps).toBe(null);
	expect(isHdr).toBe(true);
	expect(videoCodec).toBe('h264');
	expect(videoSamples).toBe(298);
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
});
