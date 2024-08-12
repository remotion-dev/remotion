import type {BufferIterator} from '../../../../buffer-iterator';

export type DecoderModelInfo = {
	type: 'decoder-model-info';
	buffer_delay_length_minus_1: number;
	num_units_in_decoding_tick: number;
	buffer_removal_time_length_minus_1: number;
	frame_presentation_time_length_minus_1: number;
};

export const parseDecoderModelInfo = (
	stream: BufferIterator,
): DecoderModelInfo => {
	const buffer_delay_length_minus_1 = stream.getBits(5);
	const num_units_in_decoding_tick = stream.getBits(32);
	const buffer_removal_time_length_minus_1 = stream.getBits(5);
	const frame_presentation_time_length_minus_1 = stream.getBits(5);

	return {
		type: 'decoder-model-info',
		buffer_delay_length_minus_1,
		num_units_in_decoding_tick,
		buffer_removal_time_length_minus_1,
		frame_presentation_time_length_minus_1,
	};
};
