import {CanvasInternals} from '@remotion/sdk';

export type {PointerSessionEndReason} from '@remotion/sdk';

export const {
	isPointerSessionRelease,
	observePointerRelease,
	startCapturedPointerSession,
	startDeferredCapturedPointerSession,
}: typeof CanvasInternals = CanvasInternals;
