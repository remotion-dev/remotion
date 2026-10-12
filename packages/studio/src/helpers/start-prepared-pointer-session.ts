import type {PointerSessionEndReason} from './pointer-session';
import {
	isPointerSessionRelease,
	startCapturedPointerSession,
} from './pointer-session';

type PreparedPointerHandlers = {
	onMove: (event: PointerEvent) => void;
	onEnd: (reason: PointerSessionEndReason, event: PointerEvent | null) => void;
};

export const startPreparedPointerSession = <T>({
	event,
	captureTarget,
	minimumMovement,
	prepare,
	onReady,
	onCancel,
	onError,
}: {
	event: PointerEvent;
	captureTarget: Element;
	minimumMovement: number | null;
	prepare: () => Promise<T>;
	onReady: (prepared: T) => PreparedPointerHandlers;
	onCancel: () => void;
	onError: (error: unknown) => void;
}): (() => void) => {
	let active = true;
	let preparing = false;
	let handlers: PreparedPointerHandlers | null = null;
	let latestMove: PointerEvent | null = null;
	let release: {reason: PointerSessionEndReason; event: PointerEvent} | null =
		null;
	const movedEnough = (move: PointerEvent) =>
		minimumMovement === null ||
		Math.abs(move.clientX - event.clientX) >= minimumMovement;
	const beginPreparation = () => {
		preparing = true;
		prepare()
			.then((prepared) => {
				if (!active) return;
				handlers = onReady(prepared);
				if (release) {
					active = false;
					handlers.onEnd(release.reason, release.event);
				} else if (latestMove) {
					handlers.onMove(latestMove);
				}
			})
			.catch((error) => {
				if (!active) return;
				cancel();
				onError(error);
			});
	};

	const stopCapture = startCapturedPointerSession({
		event,
		captureTarget,
		onMove: (move) => {
			latestMove = move;
			if (!preparing && movedEnough(move)) beginPreparation();
			handlers?.onMove(move);
		},
		onEnd: (reason, endEvent) => {
			if (!active) return;
			if (handlers) {
				active = false;
				handlers.onEnd(reason, endEvent);
			} else if (
				isPointerSessionRelease(reason, endEvent) &&
				(preparing || movedEnough(endEvent))
			) {
				// A quick drag can finish before preparation. Apply its final position
				// only once the bounds are known; a new gesture/unmount can cancel it.
				release = {reason, event: endEvent};
				if (!preparing) beginPreparation();
			} else {
				active = false;
				onCancel();
			}
		},
	});
	const cancel = () => {
		if (!active) return;
		stopCapture();
		if (!active) return;
		active = false;
		onCancel();
	};

	if (minimumMovement === null) beginPreparation();
	return cancel;
};
