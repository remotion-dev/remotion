import type {AnySegment} from '../../parse-result';
import type {MainSegment} from './segments/main';
import type {
	CodecSegment,
	TrackEntrySegment,
	TrackNumberSegment,
} from './segments/track-entry';

export const getMainSegment = (segments: AnySegment[]): MainSegment | null => {
	return segments.find((s) => s.type === 'main-segment') as MainSegment | null;
};

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

export const getTrackTimestampScale = (track: TrackEntrySegment) => {
	const child = track.children.find((b) => b.type === 'TrackTimestampScale');
	if (!child) {
		return null;
	}

	if (child.type !== 'TrackTimestampScale') {
		throw new Error('Expected TrackTimestampScale');
	}

	return child.value;
};

export const getTrackByNumber = (tracks: TrackEntrySegment[], id: number) => {
	return tracks.find((track) => {
		const trackNumber = getTrackNumber(track);
		return trackNumber === id;
	});
};
