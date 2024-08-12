import type {Av1BitstreamHeaderSegment} from './bitstream/av1/header-segment';
import type {
	ClusterSegment,
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

export const getAv1BitstreamHeader = (
	clusterSegment: ClusterSegment,
): Av1BitstreamHeaderSegment | null => {
	const simpleBlockSegment = clusterSegment.children.find((b) => {
		if (b.type !== 'simple-block-segment') {
			return false;
		}

		const child = b.children.find((c) => c.type === 'av1-bitstream-header');
		return child;
	});

	if (
		!simpleBlockSegment ||
		simpleBlockSegment.type !== 'simple-block-segment'
	) {
		throw new Error('Could not find simple block segment');
	}

	const av1BitstreamHeader = simpleBlockSegment.children.find(
		(c) => c.type === 'av1-bitstream-header',
	);

	if (
		!av1BitstreamHeader ||
		av1BitstreamHeader.type !== 'av1-bitstream-header'
	) {
		throw new Error('Could not find av1 bitstream header');
	}

	return av1BitstreamHeader ?? null;
};
