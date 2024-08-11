// https://aomediacodec.github.io/av1-isobmff/#codecsparam

import type {TrackEntrySegment} from './boxes/webm/segments/track-entry';

export const av1CodecStringToString = (track: TrackEntrySegment): string => {
	const codecSegment = track.children.find((b) => b.type === 'codec-segment');

	if (!codecSegment || codecSegment.type !== 'codec-segment') {
		throw new Error('Expected codec segment');
	}

	if (codecSegment.codec !== 'V_AV1') {
		throw new Error(`Unknown codec: ${codecSegment.codec}`);
	}

	const str = 'av01.';

	return str;
};
