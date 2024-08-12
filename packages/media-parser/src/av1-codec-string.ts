// https://aomediacodec.github.io/av1-isobmff/#codecsparam

import type {
	ClusterSegment,
	TrackEntrySegment,
} from './boxes/webm/segments/track-entry';
import {getAv1BitstreamHeader} from './boxes/webm/traversal';
import {getCodecSegment} from './traversal';

export const av1CodecStringToString = ({
	track,
	clusterSegment,
}: {
	track: TrackEntrySegment;
	clusterSegment: ClusterSegment;
}): string => {
	const codecSegment = getCodecSegment(track);

	if (!codecSegment) {
		throw new Error('Expected codec segment');
	}

	if (codecSegment.codec !== 'V_AV1') {
		throw new Error(
			`Should not call this function if it is not AV1: ${codecSegment.codec}`,
		);
	}

	const av1BitstreamHeader = getAv1BitstreamHeader(clusterSegment);
	if (!av1BitstreamHeader) {
		throw new Error('Could not find av1 bitstream header');
	}

	let str = 'av01.';

	// Profile
	str += av1BitstreamHeader.seq_profile;
	str += '.';

	// Level
	// The level parameter value SHALL equal the first level value indicated by seq_level_idx in the Sequence Header OBU
	str += av1BitstreamHeader.seq_level[0].seq_level_idx
		.toString()
		.padStart(2, '0');

	// Tier
	// The tier parameter value SHALL be equal to M when the first seq_tier value in the Sequence Header OBU is equal to 0, and H when it is equal to 1
	str += av1BitstreamHeader.seq_level[0].seq_tier ? 'H' : 'M';
	str += '.';

	// bitDepth
	// The bitDepth parameter value SHALL equal the value of BitDepth variable as defined in [AV1] derived from the Sequence Header OBU
	str += av1BitstreamHeader.color_config.bitDepth.toString().padStart(2, '0');
	str += '.';

	// monochrome
	// The monochrome parameter value, represented by a single digit decimal, SHALL equal the value of mono_chrome in the Sequence Header OBU
	str += av1BitstreamHeader.color_config.mono_chrome ? '1' : '0';
	str += '.';

	// The chromaSubsampling parameter value, represented by a three-digit decimal,
	// SHALL have its first digit equal to subsampling_x
	str += av1BitstreamHeader.color_config.subsampling_x ? '1' : '0';
	// and its second digit equal to subsampling_y.
	str += av1BitstreamHeader.color_config.subsampling_y ? '1' : '0';
	// If both subsampling_x and subsampling_y are set to 1, then the third digit SHALL be equal to chroma_sample_position, otherwise it SHALL be set to 0
	str +=
		av1BitstreamHeader.color_config.subsampling_x &&
		av1BitstreamHeader.color_config.subsampling_y
			? av1BitstreamHeader.color_config.chroma_sample_position === 1
				? '1'
				: '0'
			: '0';
	str += '.';

	// The colorPrimaries, transferCharacteristics, matrixCoefficients, and videoFullRangeFlag parameter values are set as follows:
	// If a colr box with colour_type set to nclx is present, the colorPrimaries, transferCharacteristics, matrixCoefficients, and videoFullRangeFlag parameter values SHALL equal the values of matching fields in the colr box.
	// This is not implemented in matroska

	// Otherwise, a colr box with colour_type set to nclx is absent.
	// If the color_description_present_flag is set to 1 in the Sequence Header OBU, the colorPrimaries, transferCharacteristics, and matrixCoefficients parameter values SHALL equal the values of matching fields in the Sequence Header OBU.
	if (av1BitstreamHeader.color_config.color_description_present_flag) {
		str += av1BitstreamHeader.color_config.color_primaries
			.toString()
			.padStart(2, '0');
		str += '.';
		str += av1BitstreamHeader.color_config.transfer_characteristics
			.toString()
			.padStart(2, '0');
		str += '.';
		str += av1BitstreamHeader.color_config.matrix_coefficients
			.toString()
			.padStart(2, '0');
		str += '.';
		//		The videoFullRangeFlag parameter value SHALL equal the color_range flag in the Sequence Header OBU.
		str += av1BitstreamHeader.color_config.color_range ? '1' : '0';
	} else {
		// Otherwise, the color_description_present_flag is set to 0 in the Sequence Header OBU. The colorPrimaries, transferCharacteristics, and matrixCoefficients parameter values SHOULD be set to the default values below.
		// colorPrimaries 01 (ITU-R BT.709)
		str += '01';
		str += '.';
		// transferCharacteristics 01 (ITU-R BT.709)
		str += '01';
		str += '.';
		// matrixCoefficients 00 (ITU-R BT.709)
		str += '01';
		str += '.';
		// videoFullRangeFlag 0 (studio swing representation)
		str += '0';
	}

	return str;
};
