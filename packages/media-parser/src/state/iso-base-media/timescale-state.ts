export const movieTimeScaleState = () => {
	let trackTimescale: number | null = null;

	return {
		getTrackTimescale: () => trackTimescale,
		setTrackTimescale: (timescale: number) => {
			trackTimescale = timescale;
		},
	};
};

export type MovieTimeScaleState = ReturnType<typeof movieTimeScaleState>;
