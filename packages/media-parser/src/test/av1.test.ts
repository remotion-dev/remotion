import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {nodeReader} from '../from-node';
import {trakBoxContainsVideo} from '../get-fps';
import {getAv1CBox} from '../get-sample-aspect-ratio';
import {parseMedia} from '../parse-media';
import {getMoovBox, getTraks} from '../traversal';

test('AV1 in MP4', async () => {
	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.av1mp4,
		fields: {
			durationInSeconds: true,
			fps: true,
			videoCodec: true,
			tracks: true,
			audioCodec: true,
			dimensions: true,
			rotation: true,
			boxes: true,
		},
		reader: nodeReader,
	});

	const moovBox = getMoovBox(parsed.boxes);
	if (!moovBox) {
		throw new Error('No moov box');
	}

	const traks = getTraks(moovBox).filter((t) => trakBoxContainsVideo(t))[0];
	const avc1Box = getAv1CBox(traks);
	expect(avc1Box).toEqual({
		type: 'av1C-box',
		marker: 1,
		version: 1,
		seq_profile: 0,
		seq_level_idx: 8,
		seq_tier_0: 0,
		chroma_sample_position: 0,
		high_bitdepth: false,
		twelve_bit: false,
		mono_chrome: false,
		chroma_subsampling_x: true,
		chroma_subsampling_y: true,
		reserved: 0,
		initial_presentation_delay_minus_one: null,
		av1HeaderSegment: {
			additional_frame_id_length_minus_1: null,
			color_config: {
				bitDepth: 8,
				chroma_sample_position: 0,
				color_description_present_flag: false,
				color_primaries: 2,
				color_range: false,
				matrix_coefficients: 2,
				mono_chrome: false,
				numPlanes: 3,
				separate_uv_delta_q: 0,
				subsampling_x: true,
				subsampling_y: true,
				transfer_characteristics: 2,
			},
			decoder_model_info: null,
			decoder_model_info_present_flag: false,
			delta_frame_id_length_minus_2: null,
			enable_cdef: true,
			enable_dual_filter: 0,
			enable_filter_intra: true,
			enable_interintra_compound: 0,
			enable_intra_edge_filter: true,
			enable_jnt_comp: true,
			enable_masked_compound: 1,
			enable_order_hint: 1,
			enable_ref_frame_mvs: true,
			enable_restoration: false,
			enable_superres: false,
			enable_warped_motion: 1,
			frame_height_bits_minus_1: 10,
			frame_width_bits_minus_1: 10,
			initial_display_delay_minus_1: [],
			initial_display_delay_present_flag: false,
			max_frame_height_minus_1: 1079,
			max_frame_width_minus_1: 1919,
			operating_parameters_info: [],
			operating_points_cnt_minus_1: 0,
			orderHintBits: 7,
			reduced_still_picture_header: false,
			seq_force_integer_mv: 2,
			seq_force_screen_content_tools: 2,
			seq_level: [
				{
					operating_point_idc: 0,
					seq_level_idx: 8,
					seq_tier: 0,
				},
			],
			seq_profile: 0,
			still_picture: false,
			timing_info: null,
			timing_info_present_flag: false,
			type: 'av1-bitstream-header',
			use_128x128_superblock: true,
			film_grain_params_present: false,
		},
	});
	expect(avc1Box).toBeTruthy();

	expect(parsed.durationInSeconds).toBe(10);
	expect(parsed.fps).toBe(30);
	expect(parsed.videoCodec).toBe('av1');
	expect(parsed.videoTracks[0].codecString).toEqual('av01.0.08M.08');
	// This is true, there are no audio tracks
	expect(parsed.audioTracks).toEqual([]);
	expect(parsed.audioCodec).toEqual(null);
	expect(parsed.dimensions).toEqual({
		width: 1920,
		height: 1080,
	});
	expect(parsed.rotation).toBe(0);
});

test('AV1 in MP4 with colr atom', async () => {
	let tracks = 0;
	let samples = 0;

	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.av1mp4WithColr,
		fields: {
			durationInSeconds: true,
			fps: true,
			videoCodec: true,
			tracks: true,
			audioCodec: true,
			dimensions: true,
			rotation: true,
			boxes: true,
		},
		reader: nodeReader,
		onVideoTrack: () => {
			tracks++;
			return () => {
				samples++;
			};
		},
	});

	const moovBox = getMoovBox(parsed.boxes);
	if (!moovBox) {
		throw new Error('No moov box');
	}

	const traks = getTraks(moovBox).filter((t) => trakBoxContainsVideo(t))[0];
	const avc1Box = getAv1CBox(traks);
	expect(avc1Box).toEqual({
		type: 'av1C-box',
		marker: 1,
		version: 1,
		seq_profile: 0,
		seq_level_idx: 8,
		seq_tier_0: 0,
		chroma_sample_position: 0,
		high_bitdepth: false,
		twelve_bit: false,
		mono_chrome: false,
		chroma_subsampling_x: true,
		chroma_subsampling_y: true,
		reserved: 0,
		initial_presentation_delay_minus_one: null,
		av1HeaderSegment: {
			additional_frame_id_length_minus_1: null,
			color_config: {
				bitDepth: 8,
				chroma_sample_position: 0,
				color_description_present_flag: true,
				color_primaries: 1,
				color_range: false,
				matrix_coefficients: 1,
				mono_chrome: false,
				numPlanes: 3,
				separate_uv_delta_q: 0,
				subsampling_x: true,
				subsampling_y: true,
				transfer_characteristics: 1,
			},
			decoder_model_info: null,
			decoder_model_info_present_flag: false,
			delta_frame_id_length_minus_2: null,
			enable_cdef: false,
			enable_dual_filter: 0,
			enable_filter_intra: true,
			enable_interintra_compound: 0,
			enable_intra_edge_filter: false,
			enable_jnt_comp: false,
			enable_masked_compound: 0,
			enable_order_hint: 0,
			enable_ref_frame_mvs: false,
			enable_restoration: false,
			enable_superres: false,
			enable_warped_motion: 0,
			frame_height_bits_minus_1: 10,
			frame_width_bits_minus_1: 10,
			initial_display_delay_minus_1: [],
			initial_display_delay_present_flag: false,
			max_frame_height_minus_1: 1079,
			max_frame_width_minus_1: 1919,
			operating_parameters_info: [],
			operating_points_cnt_minus_1: 0,
			orderHintBits: 0,
			reduced_still_picture_header: false,
			seq_force_integer_mv: 2,
			seq_force_screen_content_tools: 0,
			seq_level: [
				{
					operating_point_idc: 0,
					seq_level_idx: 8,
					seq_tier: 0,
				},
			],
			seq_profile: 0,
			still_picture: false,
			timing_info: null,
			timing_info_present_flag: false,
			type: 'av1-bitstream-header',
			use_128x128_superblock: true,
			film_grain_params_present: false,
		},
	});
	expect(avc1Box).toBeTruthy();

	expect(parsed.durationInSeconds).toBe(1);
	expect(parsed.fps).toBe(25);
	expect(parsed.videoCodec).toBe('av1');
	expect(parsed.videoTracks[0].codecString).toEqual('av01.0.08M.08');
	// This is true, there are no audio tracks
	expect(parsed.audioTracks).toEqual([]);
	expect(parsed.audioCodec).toEqual(null);
	expect(parsed.dimensions).toEqual({
		width: 1920,
		height: 1080,
	});
	expect(parsed.rotation).toBe(0);
	expect(tracks).toBe(1);
	expect(samples).toBe(25);
});
