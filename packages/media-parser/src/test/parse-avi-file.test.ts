import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('AVI file', async () => {
	const {structure, audioTracks, videoTracks} = await parseMedia({
		src: exampleVideos.avi,
		reader: nodeReader,
		fields: {
			structure: true,
			tracks: true,
		},
	});
	expect(audioTracks).toEqual([
		{
			codec: 'mp4a.40.2',
			codecPrivate: null,
			codecWithoutConfig: 'aac',
			description: undefined,
			numberOfChannels: 2,
			sampleRate: 48000,
			timescale: 375,
			trackId: 1,
			trakBox: null,
			type: 'audio',
		},
	]);
	expect(videoTracks).toEqual([
		{
			codec: 'avc1',
			codecPrivate: null,
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
			timescale: 30,
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
							},
							{
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
							},
							{
								avgBytesPerSecond: 17454,
								bitsPerSample: 16,
								blockAlign: 1536,
								cbSize: 0,
								formatTag: 255,
								numberOfChannels: 2,
								sampleRate: 48000,
								type: 'strf-box-audio',
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
						id: 'ISFT',
						size: 14,
						type: 'riff-box',
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
				children: [],
				listType: 'movi',
				type: 'list-box',
			},
			{
				id: 'idx1',
				size: 37376,
				type: 'riff-box',
			},
		],
	});
});
