export const isoBaseMediaState = () => {
	let shouldReturnToVideoSectionAfterEnd = false;

	return {
		getShouldReturnToVideoSectionAfterEnd: () =>
			shouldReturnToVideoSectionAfterEnd,
		setShouldReturnToVideoSectionAfterEnd: (value: boolean) => {
			shouldReturnToVideoSectionAfterEnd = value;
		},
	};
};
