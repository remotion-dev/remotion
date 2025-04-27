export type AudioSampleOffset = {
	timeInSeconds: number;
	offset: number;
	durationInSeconds: number;
};

export const audioSampleMapState = () => {
	// {[]}
	let map: AudioSampleOffset[] = [];

	const addSample = (audioSampleOffset: AudioSampleOffset) => {
		if (map.find((m) => m.offset === audioSampleOffset.offset)) {
			return;
		}

		map.push(audioSampleOffset);
	};

	return {
		addSample,
		getSamples: () => map,
		setFromSeekingHints: (newMap: AudioSampleOffset[]) => {
			map = newMap;
		},
	};
};

export type AudioSampleMapState = ReturnType<typeof audioSampleMapState>;
