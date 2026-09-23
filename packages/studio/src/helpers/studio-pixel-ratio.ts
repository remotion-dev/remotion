// Set this to a number temporarily to increase Studio canvas backing resolution.
const OVERRIDE_PIXEL_RATIO: number | null = null;

export const getStudioPixelRatio = (): number =>
	OVERRIDE_PIXEL_RATIO ?? window.devicePixelRatio;
