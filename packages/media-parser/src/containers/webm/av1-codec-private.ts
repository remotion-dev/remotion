import {getArrayBufferIterator} from '../../buffer-iterator';
import type {ColorParameterBox} from '../iso-base-media/stsd/colr';

export const parseAv1PrivateData = (
	data: Uint8Array,
	colrAtom: ColorParameterBox | null,
) => {
	const iterator = getArrayBufferIterator(data, data.byteLength);
	iterator.startReadingBits();
	if (iterator.getBits(1) !== 1) {
		iterator.destroy();
		throw new Error('Expected av1 private data to be version 1');
	}

	const version = iterator.getBits(7);
	if (version !== 1) {
		iterator.destroy();
		throw new Error(
			`Expected av1 private data to be version 1, got ${version}`,
		);
	}

	let str = 'av01.';

	// https://aomediacodec.github.io/av1-isobmff/#codecsparam

	const seqProfile = iterator.getBits(3);
	// Profile
	str += seqProfile;
	str += '.';

	const seq_level_idx = iterator.getBits(5);
	const seq_tier_0 = iterator.getBits(1);
	// Level
	// The level parameter value SHALL equal the first level value indicated by seq_level_idx in the Sequence Header OBU
	str += String(seq_level_idx).padStart(2, '0');
	str += seq_tier_0 ? 'H' : 'M';
	str += '.';

	// bitDepth
	// The bitDepth parameter value SHALL equal the value of BitDepth variable as defined in [AV1] derived from the Sequence Header OBU
	const high_bitdepth = iterator.getBits(1);
	const twelve_bit = iterator.getBits(1);
	const bitDepth =
		high_bitdepth && seqProfile === 2
			? twelve_bit
				? 12
				: 10
			: high_bitdepth
				? 10
				: 8;
	str += bitDepth.toString().padStart(2, '0');
	str += '.';

	// monochrome
	// The monochrome parameter value, represented by a single digit decimal, SHALL equal the value of mono_chrome in the Sequence Header OBU
	const mono_chrome = iterator.getBits(1);
	str += mono_chrome ? '1' : '0';
	str += '.';

	// The chromaSubsampling parameter value, represented by a three-digit decimal,
	// SHALL have its first digit equal to subsampling_x
	const subsampling_x = iterator.getBits(1);
	str += subsampling_x ? '1' : '0';

	// and its second digit equal to subsampling_y.
	const subsampling_y = iterator.getBits(1);
	str += subsampling_y ? '1' : '0';

	// If both subsampling_x and subsampling_y are set to 1, then the third digit SHALL be equal to chroma_sample_position, otherwise it SHALL be set to 0
	const chroma_sample_position = iterator.getBits(2);
	str +=
		subsampling_x && subsampling_y
			? chroma_sample_position === 1
				? '1'
				: '0'
			: '0';
	str += '.';

	if (colrAtom && colrAtom.colorType === 'transfer-characteristics') {
		str += colrAtom.primaries.toString().padStart(2, '0');
		str += '.';
		str += colrAtom.transfer.toString().padStart(2, '0');
		str += '.';
		str += colrAtom.matrixIndex.toString().padStart(2, '0');
		str += '.';
		str += colrAtom.fullRangeFlag ? '1' : '0';
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

	// If the codecs parameter string ends with ".0.110.01.01.01.0" (containing all the default values below), that trailing part of the string SHOULD be omitted.
	const suffix = '.0.110.01.01.01.0';

	if (str.endsWith(suffix)) {
		str = str.slice(0, -suffix.length);
	}

	iterator.destroy();

	return str;
};
