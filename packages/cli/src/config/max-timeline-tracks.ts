let maxTimelineTracks = 15;

export const setMaxTimelineTracks = (maxTracks: number) => {
	if (typeof maxTracks !== 'number') {
		throw new Error(
			`Need to pass a number to Config.Preview.setMaxTimelineTracks(), got ${typeof maxTracks}`
		);
	}

	if (Number.isNaN(maxTracks)) {
		throw new Error(
			`Need to pass a real number to Config.Preview.setMaxTimelineTracks(), got NaN`
		);
	}

	if (!Number.isFinite(maxTracks)) {
		throw new Error(
			`Need to pass a real number to Config.Preview.setMaxTimelineTracks(), got ${maxTracks}`
		);
	}

	if (maxTracks < 0) {
		throw new Error(
			`Need to pass a non-negative number to Config.Preview.setMaxTimelineTracks(), got ${maxTracks}`
		);
	}

	maxTimelineTracks = maxTracks;
};

export const getMaxTimelineTracks = () => {
	return maxTimelineTracks;
};
