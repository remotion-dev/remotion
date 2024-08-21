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
			type: 'Header',
			value: [
				{
					type: 'EBMLVersion',
					value: 1,
				},
				{
					type: 'EBMLReadVersion',
					value: 1,
				},
				{
					type: 'EBMLMaxIDLength',
					value: 4,
				},
				{
					type: 'EBMLMaxSizeLength',
					value: 8,
				},
				{
					type: 'DocType',
					value: 'webm',
				},
				{
					type: 'DocTypeVersion',
					value: 2,
				},
				{
					type: 'DocTypeReadVersion',
					value: 2,
				},
			],
		},
		{
			type: 'Segment',
			value: [
				{
					type: 'SeekHead',
					value: [
						{
							type: 'Seek',
							value: [
								{
									type: 'SeekID',
									value: '0x1549a966',
								},
								{
									type: 'SeekPosition',
									value: 161,
								},
							],
						},
						{
							type: 'Seek',
							value: [
								{
									type: 'SeekID',
									value: '0x1654ae6b',
								},
								{
									type: 'SeekPosition',
									value: 214,
								},
							],
						},
						{
							type: 'Seek',
							value: [
								{
									type: 'SeekID',
									value: '0x1254c367',
								},
								{
									type: 'SeekPosition',
									value: 322,
								},
							],
						},
						{
							type: 'Seek',
							value: [
								{
									type: 'SeekID',
									value: '0x1c53bb6b',
								},
								{
									type: 'SeekPosition',
									value: 347329,
								},
							],
						},
					],
				},
				{
					type: 'Void',
					value: new Uint8Array([
						0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
						0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
						0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
						0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					]),
				},
				{
					type: 'Info',
					value: [
						{
							type: 'TimestampScale',
							value: 1000000,
						},
						{
							type: 'MuxingApp',
							value: 'Lavf60.3.100',
						},
						{
							type: 'WritingApp',
							value: 'Lavf60.3.100',
						},
						{
							type: 'Duration',
							value: {
								value: 1000,
								size: '64',
							},
						},
					],
				},
				{
					type: 'Tracks',
					value: [
						{
							type: 'TrackEntry',
							value: [
								{
									type: 'TrackNumber',
									value: 1,
								},
								{
									type: 'TrackUID',
									value: '0xab2171012bb9020a',
								},
								{
									type: 'FlagLacing',
									value: 0,
								},
								{
									type: 'Language',
									value: 'und',
								},
								{
									type: 'CodecID',
									value: 'V_AV1',
								},
								{
									type: 'TrackType',
									value: 1,
								},
								{
									type: 'DefaultDuration',
									value: 40000000,
								},
								{
									type: 'Video',
									value: [
										{
											type: 'PixelWidth',
											value: 1920,
										},
										{
											type: 'PixelHeight',
											value: 1080,
										},
										{
											type: 'Colour',
											value: new Uint8Array([
												85, 186, 129, 1, 85, 177, 129, 1, 85, 187, 129, 1, 85,
												185, 129, 1,
											]),
										},
									],
								},
								{
									type: 'CodecPrivate',
									value: new Uint8Array([
										129, 8, 12, 0, 10, 14, 0, 0, 0, 66, 171, 191, 195, 118, 0,
										8, 8, 8, 8, 32,
									]),
								},
							],
						},
					],
				},
				{
					type: 'Tags',
					value: [
						{
							type: 'Tag',
							value: new Uint8Array([
								99, 192, 128, 103, 200, 153, 69, 163, 135, 69, 78, 67, 79, 68,
								69, 82, 68, 135, 140, 76, 97, 118, 102, 54, 48, 46, 51, 46, 49,
								48, 48,
							]),
						},
						{
							type: 'Tag',
							value: new Uint8Array([
								99, 192, 139, 99, 197, 136, 171, 33, 113, 1, 43, 185, 2, 10,
								103, 200, 162, 69, 163, 136, 68, 85, 82, 65, 84, 73, 79, 78, 68,
								135, 148, 48, 48, 58, 48, 48, 58, 48, 49, 46, 48, 48, 48, 48,
								48, 48, 48, 48, 48, 0, 0,
							]),
						},
					],
				},
				{
					value: [
						{
							type: 'Timestamp',
							value: 0,
						},
						{
							type: 'Block',
							value: new Uint8Array(),
						},
						{
							type: 'Block',
							value: new Uint8Array(),
						},
						{
							type: 'Block',
							value: new Uint8Array(),
						},
						{
							type: 'Block',
							value: new Uint8Array(),
						},
						{
							type: 'Block',
							value: new Uint8Array(),
						},
						{
							type: 'Block',
							value: new Uint8Array(),
						},
						{
							type: 'Block',
							value: new Uint8Array(),
						},
						{
							type: 'Block',
							value: new Uint8Array(),
						},
						{
							type: 'Block',
							value: new Uint8Array(),
						},
						{
							type: 'Block',
							value: new Uint8Array(),
						},
						{
							type: 'Block',
							value: new Uint8Array(),
						},
						{
							type: 'Block',
							value: new Uint8Array(),
						},
						{
							type: 'Block',
							value: new Uint8Array(),
						},
						{
							type: 'Block',
							value: new Uint8Array(),
						},
						{
							type: 'Block',
							value: new Uint8Array(),
						},
						{
							type: 'Block',
							value: new Uint8Array(),
						},
						{
							type: 'Block',
							value: new Uint8Array(),
						},
						{
							type: 'Block',
							value: new Uint8Array(),
						},
						{
							type: 'Block',
							value: new Uint8Array(),
						},
						{
							type: 'Block',
							value: new Uint8Array(),
						},
						{
							type: 'Block',
							value: new Uint8Array(),
						},
						{
							type: 'Block',
							value: new Uint8Array(),
						},
						{
							type: 'Block',
							value: new Uint8Array(),
						},
						{
							type: 'Block',
							value: new Uint8Array(),
						},
						{
							type: 'Block',
							value: new Uint8Array(),
						},
					],
					type: 'Cluster',
				},
				{
					type: 'Cues',
					value: new Uint8Array([
						187, 143, 179, 129, 0, 183, 138, 247, 129, 1, 241, 130, 1, 159, 240,
						129, 3,
					]),
				},
			],
		},
	]);

	expect(parsed.durationInSeconds).toBe(1);
});
