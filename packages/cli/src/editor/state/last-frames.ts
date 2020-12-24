let lastFrames: number[] = [];

export const setLastFrames = (n: number[]) => {
	lastFrames = n;
	lastFrames = lastFrames.slice(Math.max(lastFrames.length - 15, 0));
};
export const getLastFrames = () => {
	return lastFrames;
};
