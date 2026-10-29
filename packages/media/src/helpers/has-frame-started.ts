// WebM stores timestamps in whole milliseconds, so a 29.97fps frame shown at
// 7/30 = 0.2333s on a 30fps timeline is stored at 0.234s.
// The epsilon absorbs floating point error (0.501 - 0.5 > 0.001).
export const FRAME_START_TOLERANCE = 0.001 + 1e-9;

export const hasFrameStarted = (
	frameTimestamp: number,
	requestedTimestamp: number,
) => {
	return frameTimestamp - requestedTimestamp <= FRAME_START_TOLERANCE;
};
