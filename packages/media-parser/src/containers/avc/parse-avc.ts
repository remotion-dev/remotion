// https://www.itu.int/rec/T-REC-H.264-202408-I/en
// Page 455

import type {BufferIterator} from '../../buffer-iterator';
import {getArrayBufferIterator} from '../../buffer-iterator';

const Extended_SAR = 255;

type VuiParameters = {
	sar_width: number | null;
	sar_height: number | null;
	overscan_appropriate_flag: number | null;
	video_format: number | null;
	video_full_range_flag: boolean | null;
	colour_primaries: number | null;
	transfer_characteristics: number | null;
	matrix_coefficients: number | null;
	chroma_sample_loc_type_top_field: number | null;
	chroma_sample_loc_type_bottom_field: number | null;
};

const readVuiParameters = (iterator: BufferIterator): VuiParameters => {
	let sar_width: number | null = null;
	let sar_height: number | null = null;
	let overscan_appropriate_flag: number | null = null;
	let video_format: number | null = null;
	let video_full_range_flag: boolean | null = null;
	let colour_primaries: number | null = null;
	let transfer_characteristics: number | null = null;
	let matrix_coefficients: number | null = null;
	let chroma_sample_loc_type_top_field: number | null = null;
	let chroma_sample_loc_type_bottom_field: number | null = null;

	const aspect_ratio_info_present_flag = iterator.getBits(1);
	if (aspect_ratio_info_present_flag) {
		const aspect_ratio_idc = iterator.getBits(8);
		if (aspect_ratio_idc === Extended_SAR) {
			sar_width = iterator.getBits(16);
			sar_height = iterator.getBits(16);
		}
	}

	const overscan_info_present_flag = iterator.getBits(1);
	if (overscan_info_present_flag) {
		overscan_appropriate_flag = iterator.getBits(1);
	}

	const video_signal_type_present_flag = iterator.getBits(1);
	if (video_signal_type_present_flag) {
		video_format = iterator.getBits(3);
		video_full_range_flag = Boolean(iterator.getBits(1));
		const colour_description_present_flag = iterator.getBits(1);
		if (colour_description_present_flag) {
			colour_primaries = iterator.getBits(8);
			transfer_characteristics = iterator.getBits(8);
			matrix_coefficients = iterator.getBits(8);
		}
	}

	const chroma_loc_info_present_flag = iterator.getBits(1);
	if (chroma_loc_info_present_flag) {
		chroma_sample_loc_type_top_field = iterator.readExpGolomb();
		chroma_sample_loc_type_bottom_field = iterator.readExpGolomb();
	}

	return {
		sar_width,
		sar_height,
		overscan_appropriate_flag,
		chroma_sample_loc_type_bottom_field,
		chroma_sample_loc_type_top_field,
		colour_primaries,
		matrix_coefficients,
		transfer_characteristics,
		video_format,
		video_full_range_flag,
	};
};

export type SpsInfo = {
	profile: number;
	compatibility: number;
	level: number;
	seq_parameter_set_id: number;
	separate_colour_plane_flag: number | null;
	bit_depth_luma_minus8: number | null;
	bit_depth_chroma_minus8: number | null;
	qpprime_y_zero_transform_bypass_flag: number | null;
	log2_max_frame_num_minus4: number | null;
	log2_max_pic_order_cnt_lsb_minus4: number | null;
	max_num_ref_frames: number | null;
	gaps_in_frame_num_value_allowed_flag: number | null;
	pic_width_in_mbs_minus1: number;
	pic_height_in_map_units_minus1: number;
	mb_adaptive_frame_field_flag: number | null;
	direct_8x8_inference_flag: number | null;
	frame_crop_left_offset: number | null;
	frame_crop_right_offset: number | null;
	frame_crop_top_offset: number | null;
	frame_crop_bottom_offset: number | null;
	vui_parameters: VuiParameters | null;
};

const readSps = (iterator: BufferIterator): SpsInfo => {
	const profile = iterator.getUint8();
	const compatibility = iterator.getUint8();
	const level = iterator.getUint8();
	iterator.startReadingBits();
	const seq_parameter_set_id = iterator.readExpGolomb();

	let separate_colour_plane_flag: number | null = null;
	let bit_depth_luma_minus8: number | null = null;
	let bit_depth_chroma_minus8: number | null = null;
	let qpprime_y_zero_transform_bypass_flag: number | null = null;
	let log2_max_frame_num_minus4: number | null = null;
	let log2_max_pic_order_cnt_lsb_minus4: number | null = null;
	let max_num_ref_frames: number | null = null;
	let gaps_in_frame_num_value_allowed_flag: number | null = null;
	let mb_adaptive_frame_field_flag: number | null = null;
	let direct_8x8_inference_flag: number | null = null;
	let frame_crop_left_offset: number | null = null;
	let frame_crop_right_offset: number | null = null;
	let frame_crop_top_offset: number | null = null;
	let frame_crop_bottom_offset: number | null = null;
	let vui_parameters: VuiParameters | null = null;

	// Page 71
	if (
		profile === 100 ||
		profile === 110 ||
		profile === 122 ||
		profile === 244 ||
		profile === 44 ||
		profile === 83 ||
		profile === 86 ||
		profile === 118 ||
		profile === 128 ||
		profile === 138 ||
		profile === 139 ||
		profile === 134 ||
		profile === 135
	) {
		const chromaFormat = iterator.readExpGolomb();
		if (chromaFormat === 3) {
			separate_colour_plane_flag = iterator.getBits(1);
		}

		bit_depth_luma_minus8 = iterator.readExpGolomb();
		bit_depth_chroma_minus8 = iterator.readExpGolomb();
		qpprime_y_zero_transform_bypass_flag = iterator.getBits(1);
		const seq_scaling_matrix_present_flag = iterator.getBits(1);
		const seq_scaling_list_present_flag: number[] = [];

		if (seq_scaling_matrix_present_flag) {
			for (let i = 0; i < (chromaFormat !== 3 ? 8 : 12); i++) {
				seq_scaling_list_present_flag[i] = iterator.getBits(1);
				if (seq_scaling_list_present_flag[i]) {
					if (i < 6) {
						// scaling_list not implemented
						throw new Error('Not implemented');
					} else {
						// scaling_list not implemented
						throw new Error('Not implemented');
					}
				}
			}
		}
	}

	log2_max_frame_num_minus4 = iterator.readExpGolomb();
	const pic_order_cnt_type = iterator.readExpGolomb();
	if (pic_order_cnt_type === 0) {
		log2_max_pic_order_cnt_lsb_minus4 = iterator.readExpGolomb();
	} else if (pic_order_cnt_type === 1) {
		throw new Error('pic_order_cnt_type = 1 not implemented');
	}

	max_num_ref_frames = iterator.readExpGolomb();
	gaps_in_frame_num_value_allowed_flag = iterator.getBits(1);
	const pic_width_in_mbs_minus1 = iterator.readExpGolomb();
	const pic_height_in_map_units_minus1 = iterator.readExpGolomb();
	const frame_mbs_only_flag = iterator.getBits(1);
	if (!frame_mbs_only_flag) {
		mb_adaptive_frame_field_flag = iterator.getBits(1);
	}

	direct_8x8_inference_flag = iterator.getBits(1);
	const frame_cropping_flag = iterator.getBits(1);
	if (frame_cropping_flag) {
		frame_crop_left_offset = iterator.readExpGolomb();
		frame_crop_right_offset = iterator.readExpGolomb();
		frame_crop_top_offset = iterator.readExpGolomb();
		frame_crop_bottom_offset = iterator.readExpGolomb();
	}

	const vui_parameters_present_flag = iterator.getBits(1);
	if (vui_parameters_present_flag) {
		vui_parameters = readVuiParameters(iterator);
	}

	iterator.stopReadingBits();

	return {
		profile,
		compatibility,
		level,
		bit_depth_chroma_minus8,
		bit_depth_luma_minus8,
		gaps_in_frame_num_value_allowed_flag,
		log2_max_frame_num_minus4,
		log2_max_pic_order_cnt_lsb_minus4,
		max_num_ref_frames,
		pic_height_in_map_units_minus1,
		pic_width_in_mbs_minus1,
		qpprime_y_zero_transform_bypass_flag,
		separate_colour_plane_flag,
		seq_parameter_set_id,
		direct_8x8_inference_flag,
		frame_crop_bottom_offset,
		frame_crop_left_offset,
		frame_crop_right_offset,
		frame_crop_top_offset,
		mb_adaptive_frame_field_flag,
		vui_parameters,
	};
};

export type AvcProfileInfo = {
	spsData: SpsInfo;
	sps: Uint8Array;
	type: 'avc-profile';
};

export type AvcPPs = {
	type: 'avc-pps';
	pps: Uint8Array;
};

export type AvcInfo =
	| AvcProfileInfo
	| AvcPPs
	| {
			type: 'keyframe';
	  }
	| {
			type: 'delta-frame';
	  };

const findEnd = (buffer: Uint8Array) => {
	let zeroesInARow = 0;
	for (let i = 0; i < buffer.length; i++) {
		const val = buffer[i];

		if (val === 0) {
			zeroesInARow++;
			continue;
		}

		if (zeroesInARow >= 2 && val === 1) {
			return i - zeroesInARow;
		}

		zeroesInARow = 0;
	}

	return null;
};

const inspect = (buffer: Uint8Array): AvcInfo | null => {
	const iterator = getArrayBufferIterator(buffer, buffer.byteLength);
	iterator.startReadingBits();
	iterator.getBits(1);
	iterator.getBits(2);
	const type = iterator.getBits(5);
	iterator.stopReadingBits();
	if (type === 7) {
		const end = findEnd(buffer);
		const data = readSps(iterator);
		const sps = buffer.slice(0, end === null ? Infinity : end);

		return {
			spsData: data,
			sps,
			type: 'avc-profile',
		};
	}

	if (type === 5) {
		return {
			type: 'keyframe',
		};
	}

	if (type === 8) {
		const end = findEnd(buffer);
		const pps = buffer.slice(0, end === null ? Infinity : end);

		return {
			type: 'avc-pps',
			pps,
		};
	}

	if (type === 1) {
		return {
			type: 'delta-frame',
		};
	}

	iterator.destroy();
	return null;
};

// https://stackoverflow.com/questions/24884827/possible-locations-for-sequence-picture-parameter-sets-for-h-264-stream
export const parseAvc = (buffer: Uint8Array): AvcInfo[] => {
	let zeroesInARow = 0;
	const infos: AvcInfo[] = [];

	for (let i = 0; i < buffer.length; i++) {
		const val = buffer[i];

		if (val === 0) {
			zeroesInARow++;
			continue;
		}

		if (zeroesInARow >= 2 && val === 1) {
			zeroesInARow = 0;
			const info = inspect(buffer.slice(i + 1, i + 100));
			if (info) {
				infos.push(info);
				if (info.type === 'keyframe' || info.type === 'delta-frame') {
					break;
				}
			}
		}

		if (val !== 1) {
			zeroesInARow = 0;
		}
	}

	return infos;
};
