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
							timecode: 0,
							keyframe: true,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 96,
							trackNumber: 1,
							timecode: 40,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 556,
							trackNumber: 1,
							timecode: 80,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 948,
							trackNumber: 1,
							timecode: 120,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 577,
							trackNumber: 1,
							timecode: 160,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 779,
							trackNumber: 1,
							timecode: 200,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 793,
							trackNumber: 1,
							timecode: 240,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 740,
							trackNumber: 1,
							timecode: 280,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 1095,
							trackNumber: 1,
							timecode: 320,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 1097,
							trackNumber: 1,
							timecode: 360,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 1155,
							trackNumber: 1,
							timecode: 400,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 1526,
							trackNumber: 1,
							timecode: 440,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 1487,
							trackNumber: 1,
							timecode: 480,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 2046,
							trackNumber: 1,
							timecode: 520,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 1372,
							trackNumber: 1,
							timecode: 560,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 1441,
							trackNumber: 1,
							timecode: 600,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 2947,
							trackNumber: 1,
							timecode: 640,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 2652,
							trackNumber: 1,
							timecode: 680,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 4199,
							trackNumber: 1,
							timecode: 720,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 3998,
							trackNumber: 1,
							timecode: 760,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 6373,
							trackNumber: 1,
							timecode: 800,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 5955,
							trackNumber: 1,
							timecode: 840,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 7943,
							trackNumber: 1,
							timecode: 880,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 8241,
							trackNumber: 1,
							timecode: 920,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
						{
							type: 'simple-block-or-block-segment',
							length: 9506,
							trackNumber: 1,
							timecode: 960,
							keyframe: false,
							lacing: 0,
							invisible: false,
							videoSample: null,
						},
					],
				},
				{
					id: '0x1c53bb6b',
					type: 'unknown-segment',
				},
			],
		},
	]);

	expect(parsed.durationInSeconds).toBe(1);
});
