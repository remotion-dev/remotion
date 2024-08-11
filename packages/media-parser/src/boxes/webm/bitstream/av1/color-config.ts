import type {BufferIterator} from '../../../../buffer-iterator';
import {chromaSamplePositions} from './chroma-sample-position';
import {colorPrimaries} from './color-primaries';
import {matrixCoefficients} from './matrix-coefficients';
import {transferCharacteristics} from './transfer-characteristics';

export type ColorConfig = {
	bitDepth: number;
	numPlanes: number;
	color_primaries: number;
	transfer_characteristics: number;
	matrix_coefficients: number;
	separate_uv_delta_q: number;
	color_range: boolean;
	subsampling_x: boolean;
	subsampling_y: boolean;
	chroma_sample_position: number;
};

export const getColorConfig = (
	stream: BufferIterator,
	seq_profile: number,
): ColorConfig => {
	const high_bitdepth = Boolean(stream.getBits(1));
	let bitDepth = 0;
	if (seq_profile === 2 && high_bitdepth) {
		const twelve_bit = Boolean(stream.getBits(1));
		bitDepth = twelve_bit ? 12 : 10;
	} else if (seq_profile <= 2) {
		bitDepth = high_bitdepth ? 10 : 8;
	}

	const mono_chrome = seq_profile === 1 ? true : Boolean(stream.getBits(1));

	const numPlanes = mono_chrome ? 1 : 3;
	const color_description_present_flag = Boolean(stream.getBits(1));
	const color_primaries = color_description_present_flag
		? stream.getBits(8)
		: colorPrimaries.CP_UNSPECIFIED;
	const transfer_characteristics = color_description_present_flag
		? stream.getBits(8)
		: transferCharacteristics.TC_UNSPECIFIED;
	const matrix_coefficients = color_description_present_flag
		? stream.getBits(8)
		: matrixCoefficients.MC_UNSPECIFIED;
	let chroma_sample_position = chromaSamplePositions.CSP_UNKNOWN;
	let color_range = false;

	let subsampling_x = false;
	let subsampling_y = false;

	if (mono_chrome) {
		color_range = Boolean(stream.getBits(1));
		subsampling_x = true;
		subsampling_y = true;
		return {
			bitDepth,
			numPlanes,
			color_primaries,
			transfer_characteristics,
			matrix_coefficients,
			separate_uv_delta_q: 0,
			color_range,
			subsampling_x,
			subsampling_y,
			chroma_sample_position,
		};
	}

	if (
		color_primaries === colorPrimaries.CP_BT_709 &&
		transfer_characteristics === transferCharacteristics.TC_SRGB &&
		matrix_coefficients === matrixCoefficients.MC_IDENTITY
	) {
		color_range = true;
		subsampling_x = false;
		subsampling_y = false;
	} else {
		color_range = Boolean(stream.getBits(1));
		if (seq_profile === 0) {
			subsampling_x = true;
			subsampling_y = true;
		} else if (seq_profile === 1) {
			subsampling_x = false;
			subsampling_y = false;
		} else if (bitDepth === 12) {
			subsampling_x = Boolean(stream.getBits(1));
			if (subsampling_x) {
				subsampling_y = Boolean(stream.getBits(1));
			} else {
				subsampling_y = false;
			}
		} else {
			subsampling_x = true;
			subsampling_y = false;
		}

		if (subsampling_x && subsampling_y) {
			chroma_sample_position = stream.getBits(2);
		}
	}

	const separate_uv_delta_q = stream.getBits(1);

	return {
		bitDepth,
		numPlanes,
		color_primaries,
		transfer_characteristics,
		matrix_coefficients,
		separate_uv_delta_q,
		chroma_sample_position,
		color_range,
		subsampling_x,
		subsampling_y,
	};
};
