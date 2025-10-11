// https://www.itu.int/rec/T-REC-H.264-202408-I/en
// Page 455

import type {BufferIterator} from '../../iterator/buffer-iterator';
import {getArrayBufferIterator} from '../../iterator/buffer-iterator';
import type {AvcState} from '../../state/avc/avc-state';
import type {
	MediaParserAvcDeltaFrameInfo,
	MediaParserAvcKeyframeInfo,
} from '../../webcodec-sample-types';

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

const getPoc = (
	iterator: BufferIterator,
	sps: SpsInfo,
	avcState: AvcState,
	isReferencePicture: boolean,
) => {
	const {pic_order_cnt_type, log2_max_pic_order_cnt_lsb_minus4} = sps;
	if (pic_order_cnt_type !== 0) {
		return null;
	}

	const prevPicOrderCntLsb = avcState.getPrevPicOrderCntLsb();
	const prevPicOrderCntMsb = avcState.getPrevPicOrderCntMsb();

	if (log2_max_pic_order_cnt_lsb_minus4 === null) {
		throw new Error('log2_max_pic_order_cnt_lsb_minus4 is null');
	}

	const max_pic_order_cnt_lsb = 2 ** (log2_max_pic_order_cnt_lsb_minus4 + 4);
	const pic_order_cnt_lsb = iterator.getBits(
		log2_max_pic_order_cnt_lsb_minus4 + 4,
	);
	let picOrderCntMsb;
	if (
		pic_order_cnt_lsb < prevPicOrderCntLsb &&
		prevPicOrderCntLsb - pic_order_cnt_lsb >= max_pic_order_cnt_lsb / 2
	) {
		picOrderCntMsb = prevPicOrderCntMsb + max_pic_order_cnt_lsb;
	} else if (
		pic_order_cnt_lsb > prevPicOrderCntLsb &&
		pic_order_cnt_lsb - prevPicOrderCntLsb > max_pic_order_cnt_lsb / 2
	) {
		picOrderCntMsb = prevPicOrderCntMsb - max_pic_order_cnt_lsb;
	} else {
		picOrderCntMsb = prevPicOrderCntMsb;
	}

	const poc = picOrderCntMsb + pic_order_cnt_lsb;
	if (isReferencePicture) {
		avcState.setPrevPicOrderCntLsb(pic_order_cnt_lsb);
		avcState.setPrevPicOrderCntMsb(picOrderCntMsb);
	}

	return poc;
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
	log2_max_frame_num_minus4: number;
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
	pic_order_cnt_type: number;
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
		pic_order_cnt_type,
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
	| MediaParserAvcKeyframeInfo
	| MediaParserAvcDeltaFrameInfo;

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

const inspect = (buffer: Uint8Array, avcState: AvcState): AvcInfo | null => {
	const iterator = getArrayBufferIterator({
		initialData: buffer,
		maxBytes: buffer.byteLength,
		logLevel: 'error',
	});
	iterator.startReadingBits();
	iterator.getBits(1); // forbidden_zero_bit
	const nal_ref_idc = iterator.getBits(2); // nal_ref_idc
	const isReferencePicture = nal_ref_idc !== 0;

	const type = iterator.getBits(5); // nal_unit_type
	if (type === 7) {
		iterator.stopReadingBits();

		const end = findEnd(buffer);
		const data = readSps(iterator);
		const sps = buffer.slice(0, end === null ? Infinity : end);
		avcState.setSps(data);
		if (isReferencePicture) {
			avcState.setPrevPicOrderCntLsb(0);
			avcState.setPrevPicOrderCntMsb(0);
		}

		return {
			spsData: data,
			sps,
			type: 'avc-profile',
		};
	}

	if (type === 5) {
		avcState.setPrevPicOrderCntLsb(0);
		avcState.setPrevPicOrderCntMsb(0);
		iterator.readExpGolomb(); // ignore first_mb_in_slice
		iterator.readExpGolomb(); // slice_type
		iterator.readExpGolomb(); // pic_parameter_set_id
		const sps = avcState.getSps();
		if (!sps) {
			throw new Error('SPS not found');
		}

		const numberOfBitsForFrameNum = sps.log2_max_frame_num_minus4 + 4;
		iterator.getBits(numberOfBitsForFrameNum); // frame_num
		iterator.readExpGolomb(); // idr_pic_id

		const {pic_order_cnt_type} = sps;

		let poc: number | null = null;
		if (pic_order_cnt_type === 0) {
			poc = getPoc(iterator, sps, avcState, isReferencePicture);
		}

		iterator.stopReadingBits();

		return {
			type: 'keyframe',
			poc,
		};
	}

	if (type === 8) {
		iterator.stopReadingBits();

		const end = findEnd(buffer);
		const pps = buffer.slice(0, end === null ? Infinity : end);
		return {
			type: 'avc-pps',
			pps,
		};
	}

	if (type === 1) {
		iterator.readExpGolomb(); // ignore first_mb_in_slice
		const slice_type = iterator.readExpGolomb();
		const isBidirectionalFrame = slice_type === 6;
		iterator.readExpGolomb(); // pic_parameter_set_id
		const sps = avcState.getSps();
		if (!sps) {
			throw new Error('SPS not found');
		}

		const numberOfBitsForFrameNum = sps.log2_max_frame_num_minus4 + 4;
		iterator.getBits(numberOfBitsForFrameNum); // frame_num
		const {pic_order_cnt_type} = sps;

		let poc: number | null = null;
		if (pic_order_cnt_type === 0) {
			poc = getPoc(iterator, sps, avcState, isReferencePicture);
		}

		iterator.stopReadingBits();

		return {
			type: 'delta-frame',
			isBidirectionalFrame,
			poc,
		};
	}

	iterator.destroy();
	return null;
};

// https://stackoverflow.com/questions/24884827/possible-locations-for-sequence-picture-parameter-sets-for-h-264-stream
export const parseAvc = (buffer: Uint8Array, avcState: AvcState): AvcInfo[] => {
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
			const info = inspect(buffer.slice(i + 1, i + 100), avcState);
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
