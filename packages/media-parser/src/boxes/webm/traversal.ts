import type {
	CodecSegment,
	TrackEntrySegment,
	TrackNumberSegment,
} from './segments/track-entry';

export const getTrackNumber = (track: TrackEntrySegment) => {
	const child = track.children.find(
		(b) => b.type === 'track-number-segment',
	) as TrackNumberSegment | null;
	return child?.trackNumber ?? null;
};

export const getTrackCodec = (track: TrackEntrySegment) => {
	const child = track.children.find(
		(b) => b.type === 'codec-segment',
	) as CodecSegment | null;
	return child ?? null;
};

export const getTrackByNumber = (tracks: TrackEntrySegment[], id: number) => {
	return tracks.find((track) => {
		const trackNumber = getTrackNumber(track);
		return trackNumber === id;
	});
};
