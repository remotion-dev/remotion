import type {VideoTrackColorParams} from '../../get-tracks';
import {
	getMatrixCoefficientsFromIndex,
	getPrimariesFromIndex,
	getTransferCharacteristicsFromIndex,
} from './color';
import type {SpsInfo} from './parse-avc';

export const getDimensionsFromSps = (sps: SpsInfo) => {
	const height = sps.pic_height_in_map_units_minus1;
	const width = sps.pic_width_in_mbs_minus1;

	// https://stackoverflow.com/questions/12018535/get-the-width-height-of-the-video-from-h-264-nalu
	return {
		height:
			(height + 1) * 16 -
			(sps.frame_crop_bottom_offset ?? 0) * 2 -
			(sps.frame_crop_top_offset ?? 0) * 2,
		width:
			(width + 1) * 16 -
			(sps.frame_crop_right_offset ?? 0) * 2 -
			(sps.frame_crop_left_offset ?? 0) * 2,
	};
};

export const getSampleAspectRatioFromSps = (sps: SpsInfo) => {
	if (sps.vui_parameters?.sar_height && sps.vui_parameters.sar_width) {
		return {
			width: sps.vui_parameters.sar_width,
			height: sps.vui_parameters.sar_height,
		};
	}

	return {
		width: 1,
		height: 1,
	};
};

export const getVideoColorFromSps = (sps: SpsInfo): VideoTrackColorParams => {
	const matrixCoefficients = sps.vui_parameters?.matrix_coefficients;
	const transferCharacteristics = sps.vui_parameters?.transfer_characteristics;
	const colorPrimaries = sps.vui_parameters?.colour_primaries;

	return {
		matrixCoefficients: matrixCoefficients
			? getMatrixCoefficientsFromIndex(matrixCoefficients)
			: null,
		transferCharacteristics: transferCharacteristics
			? getTransferCharacteristicsFromIndex(transferCharacteristics)
			: null,
		primaries: colorPrimaries ? getPrimariesFromIndex(colorPrimaries) : null,
		fullRange: sps.vui_parameters?.video_full_range_flag ?? null,
	};
};
