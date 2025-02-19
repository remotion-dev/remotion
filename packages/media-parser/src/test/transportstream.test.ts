import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {combineUint8Arrays} from '../combine-uint8-arrays';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('Transport stream', async () => {
	let audioSamples = 0;
	let videoSamples = 0;

	let h264File = new Uint8Array([]);

	const {
		structure,
		durationInSeconds,
		dimensions,
		container,
		audioCodec,
		fps,
		isHdr,
		videoCodec,
		slowDurationInSeconds,
		slowFps,
		slowNumberOfFrames,
		slowKeyframes,
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
			slowDurationInSeconds: true,
			slowFps: true,
			slowNumberOfFrames: true,
			slowKeyframes: true,
		},
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
		onAudioTrack: ({track}) => {
			expect(track).toEqual({
				type: 'audio',
				codecPrivate: new Uint8Array([9, 144]),
				trackId: 257,
				trakBox: null,
				timescale: 90000,
				codecWithoutConfig: 'aac',
				codec: 'mp4a.40.2',
				description: undefined,
				numberOfChannels: 2,
				sampleRate: 48000,
			});
			return (sample) => {
				expect(sample.data[0]).toBe(255);
				audioSamples++;
			};
		},
		onVideoTrack: ({track}) => {
			expect(track).toEqual({
				rotation: 0,
				trackId: 256,
				type: 'video',
				timescale: 90000,
				codec: 'avc1.640020',
				codecPrivate: new Uint8Array([
					1, // version

					100, // profile, profile compatibility, level
					0,
					32,
					255, // reserved

					225, // reserved
					// sps length
					0,
					28,
					// sps
					103,
					100,
					0,
					32,
					172,
					217,
					0,
					180,
					22,
					236,
					5,
					168,
					72,
					144,
					74,
					0,
					0,
					3,
					0,
					2,
					168,
					58,
					104,
					0,
					30,
					48,
					99,
					44,
					// num of pps
					1,
					// pps length
					0,
					5,
					// pps
					104,
					234,
					236,
					178,
					44,
					253,
					248,
					248,
					0,
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
				h264File = combineUint8Arrays([h264File, sample.data]);

				videoSamples++;
			};
		},
	});

	const fs = await import('fs');
	if (
		process.platform === 'darwin' &&
		fs.existsSync('/opt/homebrew/bin/ffmpeg')
	) {
		const ffmpegResult = Bun.spawnSync({
			cmd: [
				'/opt/homebrew/bin/ffmpeg',
				'-i',
				exampleVideos.transportstream,
				'-codec',
				'copy',
				'-f',
				'h264',
				'-',
			],
		});
		if (ffmpegResult.exitCode !== 0) {
			throw new Error(ffmpegResult.stderr.toString('utf8'));
		}

		const output = new Uint8Array(ffmpegResult.stdout);
		expect(output).toEqual(h264File);
	} else {
		// eslint-disable-next-line no-console
		console.warn('Skipping H264 comparison because of no FFmpeg');
	}

	expect(container).toBe('transport-stream');
	expect(durationInSeconds).toBe(null);
	expect(dimensions).toEqual({
		height: 720,
		width: 720,
	});
	expect(audioSamples).toBe(234);
	expect(audioCodec).toBe('aac');
	expect(fps).toBe(null);
	expect(slowFps).toBe(59.999999999999986);
	expect(slowDurationInSeconds).toBe(4.966666666666668);
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
	expect(slowNumberOfFrames).toBe(298);
	expect(slowKeyframes).toEqual([
		{
			decodingTimeInSeconds: 10,
			positionInBytes: 564,
			presentationTimeInSeconds: 10.033333333333333,
			sizeInBytes: 23814,
			trackId: 256,
		},
	]);
});
