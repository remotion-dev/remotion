import type {OnTrackEntrySegment} from '../boxes/webm/segments';
import type {TrackInfo} from '../boxes/webm/segments/track-entry';
import {
	getTrackCodec,
	getTrackId,
	getTrackTimestampScale,
} from '../boxes/webm/traversal';

export const webmState = () => {
	const trackEntries: Record<number, TrackInfo> = {};

	const onTrackEntrySegment: OnTrackEntrySegment = (trackEntry) => {
		const trackId = getTrackId(trackEntry);
		if (!trackId) {
			throw new Error('Expected track id');
		}

		if (trackEntries[trackId]) {
			return;
		}

		const codec = getTrackCodec(trackEntry);
		if (!codec) {
			throw new Error('Expected codec');
		}

		const trackTimescale = getTrackTimestampScale(trackEntry);

		trackEntries[trackId] = {
			codec: codec.value,
			trackTimescale: trackTimescale?.value ?? null,
		};
	};

	return {
		onTrackEntrySegment,
		getTrackInfoByNumber: (id: number) => trackEntries[id],
	};
};
