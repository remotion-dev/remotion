import type {PointerSessionEndReason} from './pointer-session';
import {
	isPointerSessionRelease,
	startCapturedPointerSession,
} from './pointer-session';

type PointerHandlers = {
	onMove: (event: PointerEvent) => void;
	onEnd: (reason: PointerSessionEndReason, event: PointerEvent | null) => void;
};

export const startThresholdPointerSession = ({
	event,
	captureTarget,
	minimumMovement,
	onStart,
	onCancel,
}: {
	event: PointerEvent;
	captureTarget: Element;
	minimumMovement: number | null;
	onStart: () => PointerHandlers;
	onCancel: () => void;
}): (() => void) => {
	let handlers = minimumMovement === null ? onStart() : null;
	const movedEnough = (move: PointerEvent) =>
		Math.abs(move.clientX - event.clientX) >= (minimumMovement ?? 0);
	return startCapturedPointerSession({
		event,
		captureTarget,
		onMove: (move) => {
			if (!handlers && movedEnough(move)) handlers = onStart();
			handlers?.onMove(move);
		},
		onEnd: (reason, endEvent) => {
			if (
				!handlers &&
				isPointerSessionRelease(reason, endEvent) &&
				movedEnough(endEvent)
			) {
				handlers = onStart();
			}

			if (handlers) handlers.onEnd(reason, endEvent);
			else onCancel();
		},
	});
};
