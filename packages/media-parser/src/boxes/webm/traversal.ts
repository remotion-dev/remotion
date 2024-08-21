import type {AnySegment} from '../../parse-result';
import type {
	CodecIdSegment,
	TrackEntrySegment,
	TrackNumberSegment,
} from './segments/all-segments';
import type {MainSegment} from './segments/main';

export const getMainSegment = (segments: AnySegment[]): MainSegment | null => {
	return segments.find((s) => s.type === 'main-segment') as MainSegment | null;
};

export const getTrackNumber = (track: TrackEntrySegment) => {
	const child = track.value.find(
		(b) => b.type === 'TrackNumber',
	) as TrackNumberSegment | null;
	return child?.value ?? null;
};

export const getTrackCodec = (track: TrackEntrySegment) => {
	const child = track.value.find(
		(b) => b.type === 'CodecID',
	) as CodecIdSegment | null;
	return child ?? null;
};

export const getTrackTimestampScale = (track: TrackEntrySegment) => {
	const child = track.value.find((b) => b.type === 'TrackTimestampScale');
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
