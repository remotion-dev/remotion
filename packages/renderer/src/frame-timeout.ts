export class FrameTimeoutError extends Error {}
export const getFrameTimeout = (timeoutInMilliseconds: number) => {
	return Math.min(timeoutInMilliseconds * 4 + 6000, 2 ** 31 - 1);
};
