import type {Track} from '../../get-tracks';
import {getTrack} from './get-track';
import type {MainSegment} from './segments/all-segments';
import {getTracksSegment} from './traversal';

export const getTracksFromMatroska = (
	segment: MainSegment,
	timescale: number,
): Track[] => {
	const tracksSegment = getTracksSegment(segment);
	if (!tracksSegment) {
		throw new Error('No tracks segment');
	}

	const tracks: Track[] = [];

	for (const trackEntrySegment of tracksSegment.value) {
		if (trackEntrySegment.type === 'Crc32') {
			continue;
		}

		if (trackEntrySegment.type !== 'TrackEntry') {
			throw new Error('Expected track entry segment');
		}

		const track = getTrack({
			track: trackEntrySegment,
			timescale,
		});
		if (track) {
			tracks.push(track);
		}
	}

	return tracks;
};
