export class FrameTimeoutError extends Error {}

// Longer than all timed steps of a frame combined: two waitForReady() calls
// (timeoutInMilliseconds + 3000 each) and remotion_setFrame
// (timeoutInMilliseconds), plus one more timeoutInMilliseconds for the steps
// that have no timeout. setTimeout() treats anything above 2^31 - 1 ms as 1 ms.
export const getFrameTimeout = (timeoutInMilliseconds: number) => {
	return Math.min(timeoutInMilliseconds * 4 + 6000, 2 ** 31 - 1);
};
