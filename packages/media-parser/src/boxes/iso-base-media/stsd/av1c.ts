import type {BufferIterator} from '../../../buffer-iterator';
import type {Av1BitstreamHeaderSegment} from '../../webm/bitstream/av1/header-segment';
import {parseAv1BitstreamHeaderSegment} from '../../webm/bitstream/av1/header-segment';

export interface Av1CBox {
	type: 'av1C-box';
	marker: number;
	version: number;
	seq_profile: number;
	seq_level_idx: number;
	seq_tier_0: number;
	high_bitdepth: boolean;
	twelve_bit: boolean;
	mono_chrome: boolean;
	chroma_subsampling_x: boolean;
	chroma_subsampling_y: boolean;
	chroma_sample_position: number;
	reserved: number;
	initial_presentation_delay_minus_one: null | number;
	av1HeaderSegment: Av1BitstreamHeaderSegment;
}

export const parseAv1C = ({data}: {data: BufferIterator}): Av1CBox => {
	data.startReadingBits();

	const marker = data.getBits(1);
	const version = data.getBits(7);
	if (version !== 1) {
		throw new Error(`Unsupported AV1C version ${version}`);
	}

	const seq_profile = data.getBits(3);
	const seq_level_idx = data.getBits(5);
	const seq_tier_0 = data.getBits(1);
	const high_bitdepth = Boolean(data.getBits(1));
	const twelve_bit = Boolean(data.getBits(1));
	const mono_chrome = Boolean(data.getBits(1));
	const chroma_subsampling_x = Boolean(data.getBits(1));
	const chroma_subsampling_y = Boolean(data.getBits(1));
	const chroma_sample_position = data.getBits(2);
	const reserved = data.getBits(3);

	const initial_presentation_delay_present = Boolean(data.getBits(1));
	const initial_presentation_delay_minus_one_or_reserved = data.getBits(4);
	const initial_presentation_delay_minus_one =
		initial_presentation_delay_present
			? initial_presentation_delay_minus_one_or_reserved
			: null;

	// get bit 0
	const obuForbiddenBit = data.getBits(1);
	if (obuForbiddenBit) {
		throw new Error('obuForbiddenBit is not 0');
	}

	// get bits 1-3
	data.getBits(4);

	// get bit 4
	const obuExtensionFlag = data.getBits(1);
	// get bit 5
	const obuHasSizeField = data.getBits(1);
	// reserved bit
	data.getBits(1);

	if (obuExtensionFlag) {
		// extension
		data.getBits(6);
	}

	if (obuHasSizeField) {
		// size
		data.leb128();
	}

	const header = parseAv1BitstreamHeaderSegment(data);
	data.stopReadingBits();

	return {
		type: 'av1C-box',
		marker,
		version,
		seq_profile,
		seq_level_idx,
		seq_tier_0,
		chroma_sample_position,
		high_bitdepth,
		twelve_bit,
		mono_chrome,
		chroma_subsampling_x,
		chroma_subsampling_y,
		reserved,
		initial_presentation_delay_minus_one,
		av1HeaderSegment: header,
	};
};
