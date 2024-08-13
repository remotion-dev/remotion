import type {AudioTrack, OtherTrack, VideoTrack} from '../../get-tracks';
import {
	getClusterSegment,
	getTimescaleSegment,
	getTracksSegment,
} from '../../traversal';
import {getTrack} from './get-track';
import type {MainSegment} from './segments/main';

export const getTracksFromMatroska = (
	segment: MainSegment,
): {
	videoTracks: VideoTrack[];
	audioTracks: AudioTrack[];
	otherTracks: OtherTrack[];
} => {
	const tracksSegment = getTracksSegment(segment);
	if (!tracksSegment) {
		throw new Error('No tracks segment');
	}

	const timescale = getTimescaleSegment(segment);

	if (!timescale) {
		throw new Error('No timescale segment');
	}

	const clusterSegment = getClusterSegment(segment);

	const videoTracks: VideoTrack[] = [];
	const audioTracks: AudioTrack[] = [];
	const otherTracks: OtherTrack[] = [];

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

		if (track && track.type === 'video') {
			videoTracks.push(track);
		}

		if (track && track.type === 'audio') {
			audioTracks.push(track);
		}
	}

	return {
		videoTracks,
		audioTracks,
		otherTracks,
	};
};
