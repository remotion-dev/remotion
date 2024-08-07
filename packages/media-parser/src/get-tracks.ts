import type {StcoBox} from './boxes/iso-base-media/stsd/stco';
import type {StszBox} from './boxes/iso-base-media/stsd/stsz';
import {trakBoxContainsAudio, trakBoxContainsVideo} from './get-fps';
import type {AnySegment} from './parse-result';
import {
	getMoovBox,
	getMvhdBox,
	getStcoBox,
	getStscBox,
	getStszBox,
	getTkhdBox,
	getTraks,
} from './traversal';

type Track = {
	type: 'audio' | 'video';
	stcoBox: StcoBox | null;
	stszBox: StszBox | null;
	trackId: number;
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
		const stszBox = getStszBox(track);
		const stcoBox = getStcoBox(track);
		const stscBox = getStscBox(track);
		const tkhdBox = getTkhdBox(track);

		if (!tkhdBox) {
			throw new Error('Expected tkhd box in trak box');
		}

		if (trakBoxContainsAudio(track)) {
			foundTracks.push({
				type: 'audio',
				stcoBox,
				stszBox,
				trackId: tkhdBox.trackId,
			});
		}

		if (trakBoxContainsVideo(track)) {
			foundTracks.push({
				type: 'video',
				stcoBox,
				stszBox,
				trackId: tkhdBox.trackId,
			});
		}
	}

	return foundTracks;
};
