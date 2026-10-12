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
	prepare,
	onReady,
	onCancel,
	onError,
}: {
	event: PointerEvent;
	captureTarget: Element;
	prepare: () => Promise<T>;
	onReady: (prepared: T) => PreparedPointerHandlers;
	onCancel: () => void;
	onError: (error: unknown) => void;
}): (() => void) => {
	let active = true;
	let handlers: PreparedPointerHandlers | null = null;
	let latestMove: PointerEvent | null = null;
	let release: {reason: PointerSessionEndReason; event: PointerEvent} | null =
		null;
	const stopCapture = startCapturedPointerSession({
		event,
		captureTarget,
		onMove: (move) => {
			latestMove = move;
			handlers?.onMove(move);
		},
		onEnd: (reason, endEvent) => {
			if (!active) return;
			if (handlers) {
				active = false;
				handlers.onEnd(reason, endEvent);
			} else if (isPointerSessionRelease(reason, endEvent)) {
				// A quick drag can finish before preparation. Apply its final position
				// only once the bounds are known; a new gesture/unmount can cancel it.
				release = {reason, event: endEvent};
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
	return cancel;
};
