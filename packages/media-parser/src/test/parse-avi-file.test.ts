import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('AVI file', async () => {
	let audioTrackCount = 0;
	let videoTrackCount = 0;
	let audioSamples = 0;
	let videoSamples = 0;
	const {
		structure,
		tracks,
		size,
		container,
		audioCodec,
		dimensions,
		durationInSeconds,
		fps,
		name,
		rotation,
		videoCodec,
		numberOfAudioChannels,
		sampleRate,
	} = await parseMedia({
		src: exampleVideos.avi,
		reader: nodeReader,
		fields: {
			structure: true,
			tracks: true,
			size: true,
			container: true,
			audioCodec: true,
			dimensions: true,
			durationInSeconds: true,
			fps: true,
			name: true,
			rotation: true,
			videoCodec: true,
			sampleRate: true,
			numberOfAudioChannels: true,
		},
		onAudioTrack: () => {
			audioTrackCount++;
			return () => {
				audioSamples++;
			};
		},
		onVideoTrack: ({track}) => {
			if (track.codec !== 'avc1.640015') {
				throw new Error('unexpected codec');
			}

			videoTrackCount++;
			return () => {
				videoSamples++;
			};
		},
		acknowledgeRemotionLicense: true,
	});
	expect(container).toBe('avi');
	expect(dimensions).toEqual({
		height: 270,
		width: 480,
	});
	expect(rotation).toBe(0);
	expect(name).toBe('example.avi');
	expect(fps).toBe(30);
	expect(durationInSeconds).toEqual(30.613333333333333);
	expect(audioCodec).toBe('aac');
	expect(size).toBe(742478);
	expect(audioTrackCount).toBe(1);
	expect(videoTrackCount).toBe(1);
	expect(audioSamples).toBe(1433);
	expect(videoSamples).toBe(901);
	expect(videoCodec).toBe('h264');
	expect(tracks.audioTracks).toEqual([
		{
			codec: 'mp4a.40.2',
			codecPrivate: new Uint8Array([18, 16]),
			codecWithoutConfig: 'aac',
			description: new Uint8Array([18, 16]),
			numberOfChannels: 2,
			sampleRate: 48000,
			timescale: 1_000_000,
			trackId: 1,
			trakBox: null,
			type: 'audio',
		},
	]);
	expect(tracks.videoTracks).toEqual([
		{
			codec: 'avc1.640015',
			codecPrivate: new Uint8Array([
				1, // version
				100, // profile, profile compatibility, level
				0,
				21,
				255,
				225, // reserved
				// sps length
				0,
				26,
				// sps
				103,
				100,
				0,
				21,
				172,
				217,
				65,
				224,
				143,
				235,
				1,
				16,
				0,
				0,
				3,
				0,
				16,
				0,
				0,
				3,
				3,
				192,
				241,
				98,
				217,
				96,
				// num of pps
				1,
				// pps length
				0,
				4,
				// pps
				104,
				239,
				139,
				203,
				253,
				248,
				248,
				0,
			]),
			codecWithoutConfig: 'h264',
			codedHeight: 270,
			codedWidth: 480,
			color: {
				fullRange: null,
				matrixCoefficients: null,
				primaries: null,
				transferCharacteristics: null,
			},
			description: undefined,
			displayAspectHeight: 270,
			displayAspectWidth: 480,
			fps: 30,
			height: 270,
			rotation: 0,
			sampleAspectRatio: {
				denominator: 1,
				numerator: 1,
			},
			timescale: 1_000_000,
			trackId: 0,
			trakBox: null,
			type: 'video',
			width: 480,
		},
	]);
	expect(structure).toEqual({
		type: 'riff',
		boxes: [
			{
				fileSize: 742470,
				fileType: 'AVI',
				type: 'riff-header',
			},
			{
				children: [
					{
						microSecPerFrame: 33333,
						maxBytesPerSecond: 17454,
						paddingGranularity: 0,
						type: 'avih-box',
						flags: 2320,
						totalFrames: 901,
						initialFrames: 0,
						streams: 2,
						suggestedBufferSize: 1048576,
						width: 480,
						height: 270,
					},
					{
						children: [
							{
								type: 'strh-box',
								fccType: 'vids',
								handler: 'H264',
								flags: 0,
								initialFrames: 0,
								scale: 1,
								length: 901,
								priority: 0,
								quality: 4294967295,
								rate: 30,
								sampleSize: 0,
								start: 0,
								suggestedBufferSize: 4796,
								language: 0,
								strf: {
									biSize: 40,
									bitCount: 24,
									clrImportant: 0,
									clrUsed: 0,
									compression: 'H264',
									height: 270,
									planes: 1,
									sizeImage: 388800,
									type: 'strf-box-video',
									width: 480,
									xPelsPerMeter: 0,
									yPelsPerMeter: 0,
								},
							},
							{
								id: 'JUNK',
								size: 4120,
								type: 'riff-box',
							},
							{
								id: 'vprp',
								size: 68,
								type: 'riff-box',
							},
						],
						listType: 'strl',
						type: 'list-box',
					},
					{
						children: [
							{
								type: 'strh-box',
								fccType: 'auds',
								handler: 1,
								flags: 0,
								priority: 0,
								initialFrames: 0,
								scale: 8,
								rate: 375,
								length: 1435,
								quality: 4294967295,
								sampleSize: 0,
								start: 0,
								suggestedBufferSize: 373,
								language: 0,
								strf: {
									avgBytesPerSecond: 17454,
									bitsPerSample: 16,
									blockAlign: 1536,
									cbSize: 0,
									formatTag: 255,
									numberOfChannels: 2,
									sampleRate: 48000,
									type: 'strf-box-audio',
								},
							},
							{
								id: 'JUNK',
								size: 4120,
								type: 'riff-box',
							},
						],
						listType: 'strl',
						type: 'list-box',
					},
					{
						id: 'JUNK',
						size: 260,
						type: 'riff-box',
					},
				],
				listType: 'hdrl',
				type: 'list-box',
			},
			{
				children: [
					{
						software: 'Lavf57.19.100',
						type: 'isft-box',
					},
				],
				listType: 'INFO',
				type: 'list-box',
			},
			{
				id: 'JUNK',
				size: 1016,
				type: 'riff-box',
			},
			{
				id: 'idx1',
				size: 37376,
				type: 'riff-box',
			},
		],
	});
	expect(sampleRate).toBe(48000);
	expect(numberOfAudioChannels).toBe(2);
});
