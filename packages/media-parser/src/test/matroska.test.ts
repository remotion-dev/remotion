import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

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
					value: {value: 1, byteLength: 1},
					minVintWidth: 1,
				},
				{
					type: 'EBMLReadVersion',
					value: {value: 1, byteLength: 1},
					minVintWidth: 1,
				},
				{
					type: 'EBMLMaxIDLength',
					value: {value: 4, byteLength: 1},
					minVintWidth: 1,
				},
				{
					type: 'EBMLMaxSizeLength',
					value: {value: 8, byteLength: 1},
					minVintWidth: 1,
				},
				{
					type: 'DocType',
					value: 'webm',
					minVintWidth: 1,
				},
				{
					type: 'DocTypeVersion',
					value: {value: 2, byteLength: 1},
					minVintWidth: 1,
				},
				{
					type: 'DocTypeReadVersion',
					value: {value: 2, byteLength: 1},
					minVintWidth: 1,
				},
			],
			minVintWidth: 1,
		},
		{
			type: 'Segment',
			minVintWidth: 8,
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
									minVintWidth: 1,
								},
								{
									type: 'SeekPosition',
									value: {value: 161, byteLength: 1},
									minVintWidth: 1,
								},
							],
							minVintWidth: 1,
						},
						{
							type: 'Seek',
							value: [
								{
									type: 'SeekID',
									value: '0x1654ae6b',
									minVintWidth: 1,
								},
								{
									type: 'SeekPosition',
									value: {value: 214, byteLength: 1},
									minVintWidth: 1,
								},
							],
							minVintWidth: 1,
						},
						{
							type: 'Seek',
							value: [
								{
									type: 'SeekID',
									value: '0x1254c367',
									minVintWidth: 1,
								},
								{
									type: 'SeekPosition',
									value: {value: 322, byteLength: 2},
									minVintWidth: 1,
								},
							],
							minVintWidth: 1,
						},
						{
							type: 'Seek',
							value: [
								{
									type: 'SeekID',
									value: '0x1c53bb6b',
									minVintWidth: 1,
								},
								{
									type: 'SeekPosition',
									value: {value: 347329, byteLength: 3},
									minVintWidth: 1,
								},
							],
							minVintWidth: 1,
						},
					],
					minVintWidth: 1,
				},
				{
					type: 'Void',
					value: new Uint8Array([
						0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
						0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
						0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
						0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					]),
					minVintWidth: 8,
				},
				{
					type: 'Info',
					value: [
						{
							type: 'TimestampScale',
							value: {value: 1000000, byteLength: 3},
							minVintWidth: 1,
						},
						{
							type: 'MuxingApp',
							value: 'Lavf60.3.100',
							minVintWidth: 1,
						},
						{
							type: 'WritingApp',
							value: 'Lavf60.3.100',
							minVintWidth: 1,
						},
						{
							type: 'Duration',
							value: {
								value: 1000,
								size: '64',
							},
							minVintWidth: 1,
						},
					],
					minVintWidth: 1,
				},
				{
					type: 'Tracks',
					value: [
						{
							type: 'TrackEntry',
							value: [
								{
									type: 'TrackNumber',
									value: {value: 1, byteLength: 1},
									minVintWidth: 1,
								},
								{
									type: 'TrackUID',
									value: '0xab2171012bb9020a',
									minVintWidth: 1,
								},
								{
									type: 'FlagLacing',
									value: {value: 0, byteLength: 1},
									minVintWidth: 1,
								},
								{
									type: 'Language',
									value: 'und',
									minVintWidth: 1,
								},
								{
									type: 'CodecID',
									value: 'V_AV1',
									minVintWidth: 1,
								},
								{
									type: 'TrackType',
									value: {value: 1, byteLength: 1},
									minVintWidth: 1,
								},
								{
									type: 'DefaultDuration',
									value: {value: 40000000, byteLength: 4},
									minVintWidth: 1,
								},
								{
									type: 'Video',
									value: [
										{
											type: 'PixelWidth',
											value: {value: 1920, byteLength: 2},
											minVintWidth: 1,
										},
										{
											type: 'PixelHeight',
											value: {value: 1080, byteLength: 2},
											minVintWidth: 1,
										},
										{
											type: 'Colour',
											value: [
												{
													minVintWidth: 1,
													type: 'TransferCharacteristics',
													value: {
														byteLength: 1,
														value: 1,
													},
												},
												{
													minVintWidth: 1,
													type: 'MatrixCoefficients',
													value: {
														byteLength: 1,
														value: 1,
													},
												},
												{
													minVintWidth: 1,
													type: 'Primaries',
													value: {
														byteLength: 1,
														value: 1,
													},
												},
												{
													minVintWidth: 1,
													type: 'Range',
													value: {
														byteLength: 1,
														value: 1,
													},
												},
											],
											minVintWidth: 1,
										},
									],
									minVintWidth: 1,
								},
								{
									type: 'CodecPrivate',
									value: new Uint8Array([
										129, 8, 12, 0, 10, 14, 0, 0, 0, 66, 171, 191, 195, 118, 0,
										8, 8, 8, 8, 32,
									]),
									minVintWidth: 1,
								},
							],
							minVintWidth: 8,
						},
					],
					minVintWidth: 1,
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
							minVintWidth: 1,
						},
						{
							type: 'Tag',
							value: new Uint8Array([
								99, 192, 139, 99, 197, 136, 171, 33, 113, 1, 43, 185, 2, 10,
								103, 200, 162, 69, 163, 136, 68, 85, 82, 65, 84, 73, 79, 78, 68,
								135, 148, 48, 48, 58, 48, 48, 58, 48, 49, 46, 48, 48, 48, 48,
								48, 48, 48, 48, 48, 0, 0,
							]),
							minVintWidth: 1,
						},
					],
					minVintWidth: 1,
				},
				{
					value: [
						{
							type: 'Timestamp',
							value: {value: 0, byteLength: 1},
							minVintWidth: 1,
						},
						{
							type: 'Block',
							value: new Uint8Array(),
							minVintWidth: 3,
						},
						{
							type: 'Block',
							value: new Uint8Array(),
							minVintWidth: 1,
						},
						{
							type: 'Block',
							value: new Uint8Array(),
							minVintWidth: 2,
						},
						{
							type: 'Block',
							value: new Uint8Array(),
							minVintWidth: 2,
						},
						{
							type: 'Block',
							value: new Uint8Array(),
							minVintWidth: 2,
						},
						{
							type: 'Block',
							value: new Uint8Array(),
							minVintWidth: 2,
						},
						{
							type: 'Block',
							value: new Uint8Array(),
							minVintWidth: 2,
						},
						{
							type: 'Block',
							value: new Uint8Array(),
							minVintWidth: 2,
						},
						{
							type: 'Block',
							value: new Uint8Array(),
							minVintWidth: 2,
						},
						{
							type: 'Block',
							value: new Uint8Array(),
							minVintWidth: 2,
						},
						{
							type: 'Block',
							value: new Uint8Array(),
							minVintWidth: 2,
						},
						{
							type: 'Block',
							value: new Uint8Array(),
							minVintWidth: 2,
						},
						{
							type: 'Block',
							value: new Uint8Array(),
							minVintWidth: 2,
						},
						{
							type: 'Block',
							value: new Uint8Array(),
							minVintWidth: 2,
						},
						{
							type: 'Block',
							value: new Uint8Array(),
							minVintWidth: 2,
						},
						{
							type: 'Block',
							value: new Uint8Array(),
							minVintWidth: 2,
						},
						{
							type: 'Block',
							value: new Uint8Array(),
							minVintWidth: 2,
						},
						{
							type: 'Block',
							value: new Uint8Array(),
							minVintWidth: 2,
						},
						{
							type: 'Block',
							value: new Uint8Array(),
							minVintWidth: 2,
						},
						{
							type: 'Block',
							value: new Uint8Array(),
							minVintWidth: 2,
						},
						{
							type: 'Block',
							value: new Uint8Array(),
							minVintWidth: 2,
						},
						{
							type: 'Block',
							value: new Uint8Array(),
							minVintWidth: 2,
						},
						{
							type: 'Block',
							value: new Uint8Array(),
							minVintWidth: 2,
						},
						{
							type: 'Block',
							value: new Uint8Array(),
							minVintWidth: 2,
						},
						{
							type: 'Block',
							value: new Uint8Array(),
							minVintWidth: 2,
						},
					],
					type: 'Cluster',
					minVintWidth: 3,
				},
				{
					type: 'Cues',
					value: new Uint8Array([
						187, 143, 179, 129, 0, 183, 138, 247, 129, 1, 241, 130, 1, 159, 240,
						129, 3,
					]),
					minVintWidth: 1,
				},
			],
		},
	]);

	expect(parsed.durationInSeconds).toBe(1);
});
