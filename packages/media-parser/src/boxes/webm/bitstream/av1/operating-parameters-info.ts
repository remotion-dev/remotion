import type {BufferIterator} from '../../../../buffer-iterator';

export type OperatingParametersInfo = {
	decoder_buffer_delay: number;
	encoder_buffer_delay: number;
	low_delay_mode_flag: boolean;
};

export const parseOperatingParametersInfo = ({
	stream,
	buffer_delay_length_minus_1,
}: {
	stream: BufferIterator;
	buffer_delay_length_minus_1: number;
}): OperatingParametersInfo => {
	const n = buffer_delay_length_minus_1 + 1;
	const decoder_buffer_delay = stream.getBits(n);
	const encoder_buffer_delay = stream.getBits(n);
	const low_delay_mode_flag = Boolean(stream.getBits(1));
	return {
		decoder_buffer_delay,
		encoder_buffer_delay,
		low_delay_mode_flag,
	};
};
