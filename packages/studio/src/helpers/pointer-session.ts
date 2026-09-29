import {CanvasInternals} from '@remotion/canvas';

export type {PointerSessionEndReason} from '@remotion/canvas';

export const {
	isPointerSessionRelease,
	observePointerRelease,
	startCapturedPointerSession,
	startDeferredCapturedPointerSession,
} = CanvasInternals;
