export const formatSeconds = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const secondsLeft = Math.floor(seconds % 60);

	return `${minutes}:${secondsLeft < 10 ? '0' : ''}${secondsLeft} min`;
};
