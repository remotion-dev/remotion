import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {nodeReader} from '../from-node';
import {parseMedia} from '../parse-media';

test('Should get duration of AV1 video', async () => {
	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.av1,
		fields: {
			durationInSeconds: true,
			boxes: true,
			dimensions: true,
			fps: true,
		},
		reader: nodeReader,
	});

	expect(parsed.durationInSeconds).toBe(1);
	expect(parsed.fps).toBe(null);
	expect(parsed.dimensions).toEqual({
		width: 1920,
		height: 1080,
	});

	expect(parsed.boxes).toEqual([
		{
			hex: '0x1a45dfa3',
			type: 'Header',
			value: [
				{
					hex: '0x4286',
					type: 'EBMLVersion',
					value: 1,
				},
				{
					hex: '0x42f7',
					type: 'EBMLReadVersion',
					value: 1,
				},
				{
					hex: '0x42f2',
					type: 'EBMLMaxIDLength',
					value: 4,
				},
				{
					hex: '0x42f3',
					type: 'EBMLMaxSizeLength',
					value: 8,
				},
				{
					hex: '0x4282',
					type: 'DocType',
					value: 'webm',
				},
				{
					hex: '0x4287',
					type: 'DocTypeVersion',
					value: 2,
				},
				{
					hex: '0x4285',
					type: 'DocTypeReadVersion',
					value: 2,
				},
			],
		},
		{
			type: 'main-segment',
			children: [
				{
					type: 'seek-head-segment',
					length: 59,
					children: [
						{
							type: 'seek-segment',
							children: [
								{
									type: 'seek-id-segment',
									seekId: '0x1549a966',
								},
								{
									type: 'seek-position-segment',
									seekPosition: 161,
								},
							],
						},
						{
							type: 'seek-segment',
							children: [
								{
									type: 'seek-id-segment',
									seekId: '0x1654ae6b',
								},
								{
									type: 'seek-position-segment',
									seekPosition: 214,
								},
							],
						},
						{
							type: 'seek-segment',
							children: [
								{
									type: 'seek-id-segment',
									seekId: '0x1254c367',
								},
								{
									type: 'seek-position-segment',
									seekPosition: 322,
								},
							],
						},
						{
							type: 'seek-segment',
							children: [
								{
									type: 'seek-id-segment',
									seekId: '0x1c53bb6b',
								},
								{
									type: 'seek-position-segment',
									seekPosition: 347329,
								},
							],
						},
					],
				},
				{
					type: 'void-segment',
					length: 88,
				},
				{
					type: 'info-segment',
					length: 48,
					children: [
						{
							type: 'timestamp-scale-segment',
							timestampScale: 1000000,
						},
						{
							type: 'muxing-app-segment',
							value: 'Lavf60.3.100',
						},
						{
							type: 'writing-app-segment',
							value: 'Lavf60.3.100',
						},
						{
							type: 'duration-segment',
							duration: 1000,
						},
					],
				},
				{
					type: 'tracks-segment',
					children: [
						{
							type: 'track-entry-segment',
							children: [
								{
									type: 'track-number-segment',
									trackNumber: 1,
								},
								{
									type: 'track-uid-segment',
									trackUid: 'ab2171012bb9020a',
								},
								{
									type: 'flag-lacing-segment',
									lacing: false,
								},
								{
									type: 'language-segment',
									language: 'und',
								},
								{
									type: 'codec-segment',
									codec: 'V_AV1',
								},
								{
									type: 'track-type-segment',
									trackType: 'video',
								},
								{
									type: 'default-duration-segment',
									defaultDuration: 40000000,
								},
								{
									type: 'video-segment',
									children: [
										{
											type: 'width-segment',
											width: 1920,
										},
										{
											type: 'height-segment',
											height: 1080,
										},
										{
											type: 'color-segment',
											length: 16,
										},
									],
								},
								{
									type: 'codec-private-segment',
									codecPrivateData: new Uint8Array([
										129, 8, 12, 0, 10, 14, 0, 0, 0, 66, 171, 191, 195, 118, 0,
										8, 8, 8, 8, 32,
									]),
								},
							],
						},
					],
				},
				{
					type: 'tags-segment',
					children: [
						{
							type: 'tag-segment',
							length: 31,
						},
						{
							type: 'tag-segment',
							length: 51,
						},
					],
				},
				{
					type: 'cluster-segment',
					children: [
						{
							type: 'timestamp-segment',
							timestamp: 0,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 279307,
							trackNumber: 1,
							timecodeInMicroseconds: 0,
							keyframe: true,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 96,
							trackNumber: 1,
							timecodeInMicroseconds: 40000,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 556,
							trackNumber: 1,
							timecodeInMicroseconds: 80000,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 948,
							trackNumber: 1,
							timecodeInMicroseconds: 120000,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 577,
							trackNumber: 1,
							timecodeInMicroseconds: 160000,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 779,
							trackNumber: 1,
							timecodeInMicroseconds: 200000,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 793,
							trackNumber: 1,
							timecodeInMicroseconds: 240000,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 740,
							trackNumber: 1,
							timecodeInMicroseconds: 280000,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 1095,
							trackNumber: 1,
							timecodeInMicroseconds: 320000,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 1097,
							trackNumber: 1,
							timecodeInMicroseconds: 360000,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 1155,
							trackNumber: 1,
							timecodeInMicroseconds: 400000,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 1526,
							trackNumber: 1,
							timecodeInMicroseconds: 440000,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 1487,
							trackNumber: 1,
							timecodeInMicroseconds: 480000,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 2046,
							trackNumber: 1,
							timecodeInMicroseconds: 520000,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 1372,
							trackNumber: 1,
							timecodeInMicroseconds: 560000,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 1441,
							trackNumber: 1,
							timecodeInMicroseconds: 600000,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 2947,
							trackNumber: 1,
							timecodeInMicroseconds: 640000,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 2652,
							trackNumber: 1,
							timecodeInMicroseconds: 680000,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 4199,
							trackNumber: 1,
							timecodeInMicroseconds: 720000,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 3998,
							trackNumber: 1,
							timecodeInMicroseconds: 760000,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 6373,
							trackNumber: 1,
							timecodeInMicroseconds: 800000,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 5955,
							trackNumber: 1,
							timecodeInMicroseconds: 840000,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 7943,
							trackNumber: 1,
							timecodeInMicroseconds: 880000,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 8241,
							trackNumber: 1,
							timecodeInMicroseconds: 920000,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 9506,
							trackNumber: 1,
							timecodeInMicroseconds: 960000,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
					],
				},
				{
					hex: '0x1c53bb6b',
					type: 'Cues',
					value: undefined,
				},
			],
		},
	]);

	expect(parsed.durationInSeconds).toBe(1);
});
