import {trakBoxContainsAudio, trakBoxContainsVideo} from './get-fps';
import type {AnySegment} from './parse-result';
import {getMoovBox, getMvhdBox, getTraks} from './traversal';

type Track = {
	type: 'audio' | 'video';
};

// TODO: Use this to determine if all tracks are present
export const getNumberOfTracks = (segments: AnySegment[]): number => {
	const moovBox = getMoovBox(segments);
	if (!moovBox) {
		return 0;
	}

	const mvHdBox = getMvhdBox(moovBox);
	if (!mvHdBox) {
		return 0;
	}

	return mvHdBox.nextTrackId - 1;
};

export const getTracks = (segments: AnySegment[]): Track[] => {
	const moovBox = getMoovBox(segments);
	if (!moovBox) {
		return [];
	}

	const foundTracks: Track[] = [];
	const tracks = getTraks(moovBox);

	for (const track of tracks) {
		if (trakBoxContainsAudio(track)) {
			foundTracks.push({type: 'audio'});
		}

		if (trakBoxContainsVideo(track)) {
			foundTracks.push({type: 'video'});
		}
	}

	return foundTracks;
};
