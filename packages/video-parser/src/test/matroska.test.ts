import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {nodeReader} from '../from-node';
import {parseMedia} from '../get-video-metadata';

test('Should get duration of AV1 video', async () => {
	const parsed = await parseMedia(
		RenderInternals.exampleVideos.av1,
		{
			durationInSeconds: true,
			boxes: true,
		},
		nodeReader,
	);

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
							seekId: '0x1549a966',
							child: {
								type: 'seek-position-segment',
								seekPosition: 161,
							},
						},
						{
							type: 'seek-segment',
							seekId: '0x1654ae6b',
							child: {
								type: 'seek-position-segment',
								seekPosition: 214,
							},
						},
						{
							type: 'seek-segment',
							seekId: '0x1254c367',
							child: {
								type: 'seek-position-segment',
								seekPosition: 322,
							},
						},
						{
							type: 'seek-segment',
							seekId: '0x1c53bb6b',
							child: {
								type: 'seek-position-segment',
								seekPosition: 347329,
							},
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
									trackType: 1,
								},
								{
									type: 'default-duration-segment',
									defaultDuration: 40000000,
								},
								{
									type: 'video-segment',
									children: [
										{
											id: '0x3855b090',
											type: 'unknown-segment',
										},
									],
								},
							],
						},
					],
				},
				{
					id: '0xc71013c2',
					type: 'unknown-segment',
				},
			],
		},
	]);

	expect(parsed.durationInSeconds).toBe(1);
});
