import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {nodeReader} from '../from-node';
import {getVideoMetadata} from '../get-video-metadata';

test('Should get duration of AV1 video', async () => {
	const parsed = await getVideoMetadata(
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
							child: {type: 'seek-position-segment', seekPosition: 161},
						},
						{
							type: 'seek-segment',
							seekId: '0x1654ae6b',
							child: {type: 'seek-position-segment', seekPosition: 214},
						},
						{
							type: 'seek-segment',
							seekId: '0x1254c367',
							child: {type: 'seek-position-segment', seekPosition: 322},
						},
						{
							type: 'seek-segment',
							seekId: '0x1c53bb6b',
							child: {type: 'seek-position-segment', seekPosition: 347329},
						},
					],
				},
				{
					length: 88,
					type: 'void-segment',
				},
				{
					length: 48,
					type: 'info-segment',
					children: [
						{
							timestampScale: 1000000,
							type: 'timestamp-scale-segment',
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
							duration: 1000,
							type: 'duration-segment',
						},
					],
				},
				{
					type: 'tracks-segment',
					children: [
						{
							id: '0xae',
							type: 'unknown-segment',
						},
					],
				},
				{
					id: '0x1254c367',
					type: 'unknown-segment',
				},
			],
		},
	]);

	expect(parsed.durationInSeconds).toBe(1);
});
