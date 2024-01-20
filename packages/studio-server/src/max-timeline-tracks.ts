import {DEFAULT_TIMELINE_TRACKS} from '@remotion/studio-shared';

let maxTimelineTracks = DEFAULT_TIMELINE_TRACKS;

export const setMaxTimelineTracks = (maxTracks: number) => {
	if (typeof maxTracks !== 'number') {
		throw new Error(
			`Need to pass a number to Config.setMaxTimelineTracks(), got ${typeof maxTracks}`,
		);
	}

	if (Number.isNaN(maxTracks)) {
		throw new Error(
			`Need to pass a real number to Config.setMaxTimelineTracks(), got NaN`,
		);
	}

	if (!Number.isFinite(maxTracks)) {
		throw new Error(
			`Need to pass a real number to Config.setMaxTimelineTracks(), got ${maxTracks}`,
		);
	}

	if (maxTracks < 0) {
		throw new Error(
			`Need to pass a non-negative number to Config.setMaxTimelineTracks(), got ${maxTracks}`,
		);
	}

	maxTimelineTracks = maxTracks;
};

export const getMaxTimelineTracks = () => {
	return maxTimelineTracks;
};
