export const getMicroSecondsAheadOfTrack = (
	tracks: Record<number, number>,
	trackNumber: number,
) => {
	const currentProgress = tracks[trackNumber] ?? 0;
	const otherProgresses = Object.entries(tracks)
		.filter(([key]) => key !== String(trackNumber))
		.map(([, value]) => value);
	const minProgress = Math.min(...otherProgresses);

	const ahead = Math.max(0, currentProgress - minProgress);

	return ahead;
};
