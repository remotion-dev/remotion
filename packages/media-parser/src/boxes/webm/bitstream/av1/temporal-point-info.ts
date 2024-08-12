import type {BufferIterator} from '../../../../buffer-iterator';

export const getTemporalPointInfo = ({
	stream,
	frame_presentation_time_length_minus_1,
}: {
	stream: BufferIterator;
	frame_presentation_time_length_minus_1: number;
}): number => {
	const n = frame_presentation_time_length_minus_1 + 1;
	return stream.getBits(n);
};
