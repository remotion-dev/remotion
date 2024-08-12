import type {BufferIterator} from '../../../../buffer-iterator';
import {
	parseAv1FrameHeader,
	type Av1FrameHeader,
} from './bitstream-frame-header';
import type {Av1BitstreamHeaderSegment} from './header-segment';

export type Av1Frame = {
	type: 'av1-frame';
	header: Av1FrameHeader;
};

export const parseAv1Frame = ({
	stream,
	headerSegment,
}: {
	stream: BufferIterator;
	headerSegment: Av1BitstreamHeaderSegment;
}): Av1Frame => {
	return {
		type: 'av1-frame',
		header: parseAv1FrameHeader({
			stream,
			headerSegment,
		}),
	};
};
