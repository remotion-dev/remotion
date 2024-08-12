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
									codecPrivateData: [
										129, 8, 12, 0, 10, 14, 0, 0, 0, 66, 171, 191, 195, 118, 0,
										8, 8, 8, 8, 32,
									],
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
							type: 'simple-block-segment',
							length: 279307,
							trackNumber: 1,
							timecode: 0,
							headerFlags: 128,
							keyframe: true,
							lacing: [0, 0],
							invisible: false,
							children: [
								{
									type: 'av1-bitstream-header',
									seq_profile: 0,
									still_picture: false,
									reduced_still_picture_header: false,
									timing_info_present_flag: false,
									decoder_model_info_present_flag: false,
									initial_display_delay_present_flag: false,
									operating_points_cnt_minus_1: 0,
									seq_level: [
										{
											operating_point_idc: 0,
											seq_level_idx: 8,
											seq_tier: 0,
										},
									],
									timing_info: null,
									decoder_model_info: null,
									operating_parameters_info: [],
									initial_display_delay_minus_1: [],
									frame_width_bits_minus_1: 10,
									frame_height_bits_minus_1: 10,
									max_frame_width_minus_1: 1919,
									max_frame_height_minus_1: 1079,
									delta_frame_id_length_minus_2: null,
									additional_frame_id_length_minus_1: null,
									use_128x128_superblock: true,
									enable_filter_intra: true,
									enable_intra_edge_filter: false,
									color_config: {
										bitDepth: 8,
										numPlanes: 3,
										color_primaries: 1,
										transfer_characteristics: 1,
										matrix_coefficients: 1,
										separate_uv_delta_q: 0,
										chroma_sample_position: 0,
										color_range: false,
										subsampling_x: true,
										subsampling_y: true,
									},
									film_grain_params_present: false,
									enable_interintra_compound: 0,
									enable_masked_compound: 0,
									enable_warped_motion: 0,
									enable_order_hint: 0,
									enable_dual_filter: 0,
									enable_jnt_comp: false,
									enable_ref_frame_mvs: false,
									seq_force_screen_content_tools: 0,
									seq_force_integer_mv: 2,
									enable_superres: false,
									enable_cdef: false,
									enable_restoration: false,
									orderHintBits: 0,
								},
								{
									type: 'av1-bitstream-unimplemented',
								},
							],
						},
						{
							type: 'simple-block-segment',
							length: 96,
							trackNumber: 1,
							timecode: 40,
							headerFlags: 0,
							keyframe: false,
							lacing: [0, 0],
							invisible: false,
							children: [
								{
									type: 'av1-bitstream-unimplemented',
								},
							],
						},
						{
							type: 'simple-block-segment',
							length: 556,
							trackNumber: 1,
							timecode: 80,
							headerFlags: 0,
							keyframe: false,
							lacing: [0, 0],
							invisible: false,
							children: [
								{
									type: 'av1-bitstream-unimplemented',
								},
							],
						},
						{
							type: 'simple-block-segment',
							length: 948,
							trackNumber: 1,
							timecode: 120,
							headerFlags: 0,
							keyframe: false,
							lacing: [0, 0],
							invisible: false,
							children: [
								{
									type: 'av1-bitstream-unimplemented',
								},
							],
						},
						{
							type: 'simple-block-segment',
							length: 577,
							trackNumber: 1,
							timecode: 160,
							headerFlags: 0,
							keyframe: false,
							lacing: [0, 0],
							invisible: false,
							children: [
								{
									type: 'av1-bitstream-unimplemented',
								},
							],
						},
						{
							type: 'simple-block-segment',
							length: 779,
							trackNumber: 1,
							timecode: 200,
							headerFlags: 0,
							keyframe: false,
							lacing: [0, 0],
							invisible: false,
							children: [
								{
									type: 'av1-bitstream-unimplemented',
								},
							],
						},
						{
							type: 'simple-block-segment',
							length: 793,
							trackNumber: 1,
							timecode: 240,
							headerFlags: 0,
							keyframe: false,
							lacing: [0, 0],
							invisible: false,
							children: [
								{
									type: 'av1-bitstream-unimplemented',
								},
							],
						},
						{
							type: 'simple-block-segment',
							length: 740,
							trackNumber: 1,
							timecode: 280,
							headerFlags: 0,
							keyframe: false,
							lacing: [0, 0],
							invisible: false,
							children: [
								{
									type: 'av1-bitstream-unimplemented',
								},
							],
						},
						{
							type: 'simple-block-segment',
							length: 1095,
							trackNumber: 1,
							timecode: 320,
							headerFlags: 0,
							keyframe: false,
							lacing: [0, 0],
							invisible: false,
							children: [
								{
									type: 'av1-bitstream-unimplemented',
								},
							],
						},
						{
							type: 'simple-block-segment',
							length: 1097,
							trackNumber: 1,
							timecode: 360,
							headerFlags: 0,
							keyframe: false,
							lacing: [0, 0],
							invisible: false,
							children: [
								{
									type: 'av1-bitstream-unimplemented',
								},
							],
						},
						{
							type: 'simple-block-segment',
							length: 1155,
							trackNumber: 1,
							timecode: 400,
							headerFlags: 0,
							keyframe: false,
							lacing: [0, 0],
							invisible: false,
							children: [
								{
									type: 'av1-bitstream-unimplemented',
								},
							],
						},
						{
							type: 'simple-block-segment',
							length: 1526,
							trackNumber: 1,
							timecode: 440,
							headerFlags: 0,
							keyframe: false,
							lacing: [0, 0],
							invisible: false,
							children: [
								{
									type: 'av1-bitstream-unimplemented',
								},
							],
						},
						{
							type: 'simple-block-segment',
							length: 1487,
							trackNumber: 1,
							timecode: 480,
							headerFlags: 0,
							keyframe: false,
							lacing: [0, 0],
							invisible: false,
							children: [
								{
									type: 'av1-bitstream-unimplemented',
								},
							],
						},
						{
							type: 'simple-block-segment',
							length: 2046,
							trackNumber: 1,
							timecode: 520,
							headerFlags: 0,
							keyframe: false,
							lacing: [0, 0],
							invisible: false,
							children: [
								{
									type: 'av1-bitstream-unimplemented',
								},
							],
						},
						{
							type: 'simple-block-segment',
							length: 1372,
							trackNumber: 1,
							timecode: 560,
							headerFlags: 0,
							keyframe: false,
							lacing: [0, 0],
							invisible: false,
							children: [
								{
									type: 'av1-bitstream-unimplemented',
								},
							],
						},
						{
							type: 'simple-block-segment',
							length: 1441,
							trackNumber: 1,
							timecode: 600,
							headerFlags: 0,
							keyframe: false,
							lacing: [0, 0],
							invisible: false,
							children: [
								{
									type: 'av1-bitstream-unimplemented',
								},
							],
						},
						{
							type: 'simple-block-segment',
							length: 2947,
							trackNumber: 1,
							timecode: 640,
							headerFlags: 0,
							keyframe: false,
							lacing: [0, 0],
							invisible: false,
							children: [
								{
									type: 'av1-bitstream-unimplemented',
								},
							],
						},
						{
							type: 'simple-block-segment',
							length: 2652,
							trackNumber: 1,
							timecode: 680,
							headerFlags: 0,
							keyframe: false,
							lacing: [0, 0],
							invisible: false,
							children: [
								{
									type: 'av1-bitstream-unimplemented',
								},
							],
						},
						{
							type: 'simple-block-segment',
							length: 4199,
							trackNumber: 1,
							timecode: 720,
							headerFlags: 0,
							keyframe: false,
							lacing: [0, 0],
							invisible: false,
							children: [
								{
									type: 'av1-bitstream-unimplemented',
								},
							],
						},
						{
							type: 'simple-block-segment',
							length: 3998,
							trackNumber: 1,
							timecode: 760,
							headerFlags: 0,
							keyframe: false,
							lacing: [0, 0],
							invisible: false,
							children: [
								{
									type: 'av1-bitstream-unimplemented',
								},
							],
						},
						{
							type: 'simple-block-segment',
							length: 6373,
							trackNumber: 1,
							timecode: 800,
							headerFlags: 0,
							keyframe: false,
							lacing: [0, 0],
							invisible: false,
							children: [
								{
									type: 'av1-bitstream-unimplemented',
								},
							],
						},
						{
							type: 'simple-block-segment',
							length: 5955,
							trackNumber: 1,
							timecode: 840,
							headerFlags: 0,
							keyframe: false,
							lacing: [0, 0],
							invisible: false,
							children: [
								{
									type: 'av1-bitstream-unimplemented',
								},
							],
						},
						{
							type: 'simple-block-segment',
							length: 7943,
							trackNumber: 1,
							timecode: 880,
							headerFlags: 0,
							keyframe: false,
							lacing: [0, 0],
							invisible: false,
							children: [
								{
									type: 'av1-bitstream-unimplemented',
								},
							],
						},
						{
							type: 'simple-block-segment',
							length: 8241,
							trackNumber: 1,
							timecode: 920,
							headerFlags: 0,
							keyframe: false,
							lacing: [0, 0],
							invisible: false,
							children: [
								{
									type: 'av1-bitstream-unimplemented',
								},
							],
						},
						{
							type: 'simple-block-segment',
							length: 9506,
							trackNumber: 1,
							timecode: 960,
							headerFlags: 0,
							keyframe: false,
							lacing: [0, 0],
							invisible: false,
							children: [
								{
									type: 'av1-bitstream-unimplemented',
								},
							],
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
