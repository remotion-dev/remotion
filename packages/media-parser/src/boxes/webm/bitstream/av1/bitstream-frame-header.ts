import type {BufferIterator} from '../../../../buffer-iterator';
import type {Av1BitstreamHeaderSegment} from './header-segment';
import {getTemporalPointInfo} from './temporal-point-info';

type FrameType = 'key' | 'delta' | 'intra' | 'switch';

export type Av1FrameHeader = {
	type: 'av1-frame-header';
	frameType: FrameType;
	temporalPointInfo: number | null;
};

export const getFrameType = (frameType: number): FrameType => {
	switch (frameType) {
		case 0:
			return 'key';
		case 1:
			return 'delta';
		case 2:
			return 'intra';
		case 3:
			return 'switch';
		default:
			throw new Error('Unknown frame type');
	}
};

// https://aomediacodec.github.io/av1-spec/#uncompressed-header-syntax
// Only implmementing to get the basic stuff
export const parseAv1FrameHeader = ({
	stream,
	headerSegment,
}: {
	stream: BufferIterator;
	headerSegment: Av1BitstreamHeaderSegment;
}): Av1FrameHeader => {
	if (headerSegment.reduced_still_picture_header) {
		return {
			type: 'av1-frame-header',
			frameType: 'key',
			temporalPointInfo: null,
		};
	}

	let temporalPointInfo: number | null = null;

	const show_existing_frame = Boolean(stream.getBits(1));
	if (show_existing_frame) {
		const frame_to_show_map_idx = stream.getBits(3);
		if (
			headerSegment.decoder_model_info &&
			!headerSegment.timing_info?.equal_picture_interval
		) {
			temporalPointInfo = getTemporalPointInfo({
				stream,
				frame_presentation_time_length_minus_1:
					headerSegment.decoder_model_info
						.frame_presentation_time_length_minus_1,
			});
		}

		// TODO: this is wrong, there should be a store
		const frame_type = getFrameType(frame_to_show_map_idx);
		return {
			type: 'av1-frame-header',
			frameType: frame_type,
			temporalPointInfo,
		};
	}

	const frameType = getFrameType(stream.getBits(2));
	const showFrame = Boolean(stream.getBits(1));

	if (
		showFrame &&
		headerSegment.decoder_model_info &&
		!headerSegment.timing_info?.equal_picture_interval
	) {
		temporalPointInfo = getTemporalPointInfo({
			stream,
			frame_presentation_time_length_minus_1:
				headerSegment.decoder_model_info.frame_presentation_time_length_minus_1,
		});
	}

	return {
		type: 'av1-frame-header',
		frameType,
		temporalPointInfo,
	};
};
