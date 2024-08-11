/* eslint-disable max-depth */
import type {BufferIterator} from '../../../../buffer-iterator';
import type {ColorConfig} from './color-config';
import {getColorConfig} from './color-config';
import {
	parseDecoderModelInfo,
	type DecoderModelInfo,
} from './decoder-model-info';
import {
	parseOperatingParametersInfo,
	type OperatingParametersInfo,
} from './operating-parameters-info';
import {getTimingInfo, type TimingInfo} from './timing-info';

const makeSeqLevelIdx = () => {
	return {
		operating_point_idc: 0,
		seq_level_idx: 0,
		seq_tier: 0,
	};
};

type SeqLevelIndex = {
	operating_point_idc: number;
	seq_level_idx: number;
	seq_tier: number;
};

export type Av1BitstreamHeaderSegment = {
	type: 'av1-bitstream-header';
	seq_profile: number;
	still_picture: boolean;
	reduced_still_picture_header: boolean;
	timing_info_present_flag: boolean;
	decoder_model_info_present_flag: boolean;
	initial_display_delay_present_flag: boolean;
	operating_points_cnt_minus_1: number;
	seq_level: SeqLevelIndex[];
	timing_info: TimingInfo | null;
	decoder_model_info: DecoderModelInfo | null;
	operating_parameters_info: OperatingParametersInfo[];
	initial_display_delay_minus_1: number[];
	frame_width_bits_minus_1: number;
	frame_height_bits_minus_1: number;
	max_frame_width_minus_1: number;
	max_frame_height_minus_1: number;
	delta_frame_id_length_minus_2: number | null;
	additional_frame_id_length_minus_1: number | null;
	use_128x128_superblock: boolean;
	enable_filter_intra: boolean;
	enable_intra_edge_filter: boolean;
	color_config: ColorConfig;
	film_grain_params_present: boolean;
	enable_interintra_compound: number;
	enable_masked_compound: number;
	enable_warped_motion: number;
	enable_order_hint: number;
	enable_dual_filter: number;
	enable_jnt_comp: boolean;
	enable_ref_frame_mvs: boolean;
	seq_force_screen_content_tools: number;
	seq_force_integer_mv: number;
	enable_superres: boolean;
	enable_cdef: boolean;
	enable_restoration: boolean;
	orderHintBits: number;
};

const SELECT_SCREEN_CONTENT_TOOLS = 2;
const SELECT_INTEGER_MV = 2;

export const parseAv1BitstreamHeaderSegment = (
	stream: BufferIterator,
): Av1BitstreamHeaderSegment => {
	// https://aomediacodec.github.io/av1-spec/av1-spec.pdf
	// Page 41

	const seq_profile = stream.getBits(3);
	const still_picture = Boolean(stream.getBits(1));
	const reduced_still_picture_header = Boolean(stream.getBits(1));

	let timing_info_present_flag = false;
	let decoder_model_info_present_flag = false;
	let initial_display_delay_present_flag = false;
	let operating_points_cnt_minus_1 = 1;
	const seq_level: SeqLevelIndex[] = [];
	let timing_info: TimingInfo | null = null;
	let decoder_model_info: DecoderModelInfo | null = null;
	const operating_parameters_info: OperatingParametersInfo[] = [];
	const initial_display_delay_minus_1: number[] = [];

	if (reduced_still_picture_header) {
		timing_info_present_flag = false;
		decoder_model_info_present_flag = false;
		initial_display_delay_present_flag = false;
		operating_points_cnt_minus_1 = 0;
		seq_level[0] = makeSeqLevelIdx();
		seq_level[0].seq_level_idx = stream.getBits(5);
	} else {
		timing_info_present_flag = Boolean(stream.getBits(1));
		if (timing_info_present_flag) {
			timing_info = getTimingInfo(stream);
			decoder_model_info_present_flag = Boolean(stream.getBits(1));
			if (decoder_model_info_present_flag) {
				decoder_model_info = parseDecoderModelInfo(stream);
			}
		}

		initial_display_delay_present_flag = Boolean(stream.getBits(1));
		operating_points_cnt_minus_1 = stream.getBits(5);

		for (let i = 0; i <= operating_points_cnt_minus_1; i++) {
			seq_level[i] = makeSeqLevelIdx();
			seq_level[i].operating_point_idc = stream.getBits(12);
			seq_level[i].seq_level_idx = stream.getBits(5);
			if (seq_level[i].seq_level_idx > 7) {
				seq_level[i].seq_tier = stream.getBits(1);
			} else {
				seq_level[i].seq_tier = 0;
			}

			if (decoder_model_info) {
				const decoder_model_present_for_this_op = Boolean(stream.getBits(1));
				if (decoder_model_present_for_this_op) {
					operating_parameters_info.push(
						parseOperatingParametersInfo({
							stream,
							buffer_delay_length_minus_1:
								decoder_model_info.buffer_delay_length_minus_1,
						}),
					);
				}
			}

			if (initial_display_delay_present_flag) {
				const initial_display_delay_present_for_this_op = Boolean(
					stream.getBits(1),
				);
				if (initial_display_delay_present_for_this_op) {
					initial_display_delay_minus_1.push(stream.getBits(4));
				}
			}
		}
	}

	const frame_width_bits_minus_1 = stream.getBits(4);
	const frame_height_bits_minus_1 = stream.getBits(4);

	const n = frame_width_bits_minus_1 + 1;
	const max_frame_width_minus_1 = stream.getBits(n);
	const m = frame_height_bits_minus_1 + 1;
	const max_frame_height_minus_1 = stream.getBits(m);

	let frame_id_numbers_present_flag = false;
	if (!reduced_still_picture_header) {
		frame_id_numbers_present_flag = Boolean(stream.getBits(1));
	}

	let delta_frame_id_length_minus_2: number | null = null;
	let additional_frame_id_length_minus_1: number | null = null;

	if (frame_id_numbers_present_flag) {
		delta_frame_id_length_minus_2 = stream.getBits(4);
		additional_frame_id_length_minus_1 = stream.getBits(3);
	}

	const use_128x128_superblock = Boolean(stream.getBits(1));
	const enable_filter_intra = Boolean(stream.getBits(1));
	const enable_intra_edge_filter = Boolean(stream.getBits(1));

	let enable_interintra_compound = 0;
	let enable_masked_compound = 0;
	let enable_warped_motion = 0;
	let enable_dual_filter = 0;
	let enable_order_hint = 0;
	let enable_jnt_comp = false;
	let enable_ref_frame_mvs = false;
	let seq_force_screen_content_tools = SELECT_SCREEN_CONTENT_TOOLS;
	let seq_force_integer_mv = SELECT_INTEGER_MV;
	let orderHintBits = 0;

	if (!reduced_still_picture_header) {
		enable_interintra_compound = stream.getBits(1);
		enable_masked_compound = stream.getBits(1);
		enable_warped_motion = stream.getBits(1);
		enable_dual_filter = stream.getBits(1);
		enable_order_hint = stream.getBits(1);
		enable_jnt_comp = enable_order_hint ? Boolean(stream.getBits(1)) : false;
		enable_ref_frame_mvs = enable_order_hint
			? Boolean(stream.getBits(1))
			: false;
		const seq_choose_screen_content_tools = stream.getBits(1);
		seq_force_screen_content_tools = seq_choose_screen_content_tools
			? SELECT_SCREEN_CONTENT_TOOLS
			: stream.getBits(1);
		if (seq_choose_screen_content_tools > 0) {
			const seq_choose_integer_mv = stream.getBits(1);
			seq_force_integer_mv = seq_choose_integer_mv
				? SELECT_INTEGER_MV
				: stream.getBits(1);
		} else {
			seq_force_integer_mv = SELECT_INTEGER_MV;
		}

		if (enable_order_hint) {
			const order_hint_bits_minus_1 = stream.getBits(3);
			orderHintBits = order_hint_bits_minus_1 + 1;
		} else {
			orderHintBits = 0;
		}
	}

	const enable_superres = Boolean(stream.getBits(1));
	const enable_cdef = Boolean(stream.getBits(1));
	const enable_restoration = Boolean(stream.getBits(1));
	const color_config = getColorConfig(stream, seq_profile);
	const film_grain_params_present = Boolean(stream.getBits(1));

	return {
		type: 'av1-bitstream-header',
		seq_profile,
		still_picture,
		reduced_still_picture_header,
		timing_info_present_flag,
		decoder_model_info_present_flag,
		initial_display_delay_present_flag,
		operating_points_cnt_minus_1,
		seq_level,
		timing_info,
		decoder_model_info,
		operating_parameters_info,
		initial_display_delay_minus_1,
		frame_width_bits_minus_1,
		frame_height_bits_minus_1,
		max_frame_width_minus_1,
		max_frame_height_minus_1,
		delta_frame_id_length_minus_2,
		additional_frame_id_length_minus_1,
		use_128x128_superblock,
		enable_filter_intra,
		enable_intra_edge_filter,
		color_config,
		film_grain_params_present,
		enable_interintra_compound,
		enable_masked_compound,
		enable_warped_motion,
		enable_order_hint,
		enable_dual_filter,
		enable_jnt_comp,
		enable_ref_frame_mvs,
		seq_force_screen_content_tools,
		seq_force_integer_mv,
		enable_superres,
		enable_cdef,
		enable_restoration,
		orderHintBits,
	};
};
