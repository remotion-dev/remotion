import type {Track} from '../../get-tracks';
import {getClusterSegment, getTracksSegment} from '../../traversal';
import {getTrack} from './get-track';
import type {MainSegment} from './segments/main';

export const getTracksFromMatroska = (segment: MainSegment): Track[] => {
	const tracksSegment = getTracksSegment(segment);
	if (!tracksSegment) {
		throw new Error('No tracks segment');
	}

	const clusterSegment = getClusterSegment(segment);

	const tracks: Track[] = [];

	for (const trackEntrySegment of tracksSegment.children) {
		if (trackEntrySegment.type === 'crc32-segment') {
			continue;
		}

		if (trackEntrySegment.type !== 'track-entry-segment') {
			throw new Error('Expected track entry segment');
		}

		const track = getTrack({
			mainSegment: segment,
			clusterSegment,
			track: trackEntrySegment,
		});
		if (track) {
			tracks.push(track);
		}
	}

	return tracks;
};
