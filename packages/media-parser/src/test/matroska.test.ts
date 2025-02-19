import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('Should get duration of AV1 video', async () => {
	const parsed = await parseMedia({
		src: exampleVideos.av1,
		fields: {
			durationInSeconds: true,
			structure: true,
			dimensions: true,
			fps: true,
			slowFps: true,
			slowNumberOfFrames: true,
			numberOfAudioChannels: true,
			sampleRate: true,
			slowAudioBitrate: true,
			slowVideoBitrate: true,
		},
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
	});

	expect(parsed.durationInSeconds).toBe(1);
	expect(parsed.fps).toBe(null);
	expect(parsed.slowFps).toBe(25);
	expect(parsed.slowNumberOfFrames).toBe(25);
	expect(parsed.dimensions).toEqual({
		width: 1920,
		height: 1080,
	});
	expect(parsed.numberOfAudioChannels).toBe(null);
	expect(parsed.sampleRate).toBe(null);
	expect(parsed.slowAudioBitrate).toBe(null);
	expect(parsed.slowVideoBitrate).toBe(2773832);

	expect(parsed.structure.boxes).toEqual([
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
							minVintWidth: 1,
							type: 'Tag',
							value: [
								{
									minVintWidth: 1,
									type: 'Targets',
									value: [],
								},
								{
									minVintWidth: 1,
									type: 'SimpleTag',
									value: [
										{
											minVintWidth: 1,
											type: 'TagName',
											value: 'ENCODER',
										},
										{
											minVintWidth: 1,
											type: 'TagString',
											value: 'Lavf60.3.100',
										},
									],
								},
							],
						},
						{
							minVintWidth: 1,
							type: 'Tag',
							value: [
								{
									minVintWidth: 1,
									type: 'Targets',
									value: [
										{
											minVintWidth: 1,
											type: 'TagTrackUID',
											value: '0xab2171012bb9020a',
										},
									],
								},
								{
									minVintWidth: 1,
									type: 'SimpleTag',
									value: [
										{
											minVintWidth: 1,
											type: 'TagName',
											value: 'DURATION',
										},
										{
											minVintWidth: 1,
											type: 'TagString',
											value: '00:00:01.000000000',
										},
									],
								},
							],
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
					],
					type: 'Cluster',
					minVintWidth: 3,
				},
				{
					type: 'Cues',
					value: [
						{
							minVintWidth: 1,
							type: 'CuePoint',
							value: [
								{
									minVintWidth: 1,
									type: 'CueTime',
									value: {
										byteLength: 1,
										value: 0,
									},
								},
								{
									minVintWidth: 1,
									type: 'CueTrackPositions',
									value: [
										{
											minVintWidth: 1,
											type: 'CueTrack',
											value: {
												byteLength: 1,
												value: 1,
											},
										},
										{
											minVintWidth: 1,
											type: 'CueClusterPosition',
											value: {
												byteLength: 2,
												value: 415,
											},
										},
										{
											minVintWidth: 1,
											type: 'CueRelativePosition',
											value: {
												byteLength: 1,
												value: 3,
											},
										},
									],
								},
							],
						},
					],
					minVintWidth: 1,
				},
			],
		},
	]);

	expect(parsed.durationInSeconds).toBe(1);
});
