import {CanvasInternals} from '@remotion/sdk';
import type {TimelineSceneNode} from '../components/Timeline/timeline-scene-node';
import {isTimelineSceneNode} from '../components/Timeline/timeline-scene-node';

export type {PointerSessionEndReason} from '@remotion/sdk';

export const {isPointerSessionRelease, observePointerRelease} = CanvasInternals;

export type TimelinePointerCaptureTarget = Element | TimelineSceneNode;

const getPointerCaptureElement = (target: TimelinePointerCaptureTarget) => {
	if (!isTimelineSceneNode(target)) {
		return target;
	}

	const {canvas} = target.store;
	if (!canvas) {
		throw new Error('Cannot start a timeline gesture before its canvas mounts');
	}

	return canvas;
};

export const startCapturedPointerSession = (
	options: Omit<
		Parameters<typeof CanvasInternals.startCapturedPointerSession>[0],
		'captureTarget'
	> & {captureTarget: TimelinePointerCaptureTarget},
) => {
	return CanvasInternals.startCapturedPointerSession({
		...options,
		captureTarget: getPointerCaptureElement(options.captureTarget),
	});
};

export const startDeferredCapturedPointerSession = (
	options: Omit<
		Parameters<typeof CanvasInternals.startDeferredCapturedPointerSession>[0],
		'captureTarget'
	> & {captureTarget: TimelinePointerCaptureTarget},
) => {
	return CanvasInternals.startDeferredCapturedPointerSession({
		...options,
		captureTarget: getPointerCaptureElement(options.captureTarget),
	});
};
