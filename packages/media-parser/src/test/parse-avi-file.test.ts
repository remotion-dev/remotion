import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('AVI file', async () => {
	const {boxes} = await parseMedia({
		src: exampleVideos.avi,
		reader: nodeReader,
		fields: {
			boxes: true,
		},
	});
	expect(boxes).toEqual([
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
							id: 'strh',
							size: 56,
							type: 'riff-box',
						},
						{
							id: 'strf',
							size: 40,
							type: 'riff-box',
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
							id: 'strh',
							size: 56,
							type: 'riff-box',
						},
						{
							id: 'strf',
							size: 18,
							type: 'riff-box',
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
	]);
});
