export const formatElapsedTime = (elapsedTimeInMs: number): string => {
	const totalSeconds = Math.floor(elapsedTimeInMs / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};
