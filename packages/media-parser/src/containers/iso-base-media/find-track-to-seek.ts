import type {SamplePosition} from '../../get-sample-positions';
import type {AudioTrack, OtherTrack, VideoTrack} from '../../get-tracks';
import {collectSamplePositionsFromTrak} from './collect-sample-positions-from-trak';
import type {TrakBox} from './trak/trak';

export const findAnyTrackWithSamplePositions = (
	allTracks: (VideoTrack | AudioTrack | OtherTrack)[],
) => {
	for (const track of allTracks) {
		if (track.type === 'video' || track.type === 'audio') {
			const samplePositions = collectSamplePositionsFromTrak(
				track.trakBox as TrakBox,
			);

			if (samplePositions.length === 0) {
				continue;
			}

			return {track, samplePositions};
		}
	}

	throw new Error('No track with sample positions found');
};

type TrackWithSamplePositions = {
	track: VideoTrack | AudioTrack;
	samplePositions: SamplePosition[];
};

export const findTrackToSeek = (
	allTracks: (VideoTrack | AudioTrack | OtherTrack)[],
): TrackWithSamplePositions => {
	const firstVideoTrack = allTracks.find((t) => t.type === 'video');

	if (!firstVideoTrack) {
		return findAnyTrackWithSamplePositions(allTracks);
	}

	const samplePositions = collectSamplePositionsFromTrak(
		firstVideoTrack.trakBox as TrakBox,
	);

	if (samplePositions.length === 0) {
		return findAnyTrackWithSamplePositions(allTracks);
	}

	return {track: firstVideoTrack, samplePositions};
};
