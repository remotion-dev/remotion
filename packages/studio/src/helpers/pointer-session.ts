export type PointerSessionEndReason =
	| 'pointerup'
	| 'pointercancel'
	| 'lostpointercapture'
	| 'blur'
	| 'visibilitychange'
	| 'buttons-released'
	| 'manual';

type PointerSessionEvent = Pick<PointerEvent, 'button' | 'pointerId'>;

const getButtonMask = (button: number) => {
	if (button === 0) {
		return 1;
	}

	if (button === 1) {
		return 4;
	}

	if (button === 2) {
		return 2;
	}

	return 1 << button;
};

const startPointerSession = ({
	event,
	captureTarget,
	onMove,
	onEnd,
}: {
	event: PointerSessionEvent;
	captureTarget: Element | null;
	onMove?: (event: PointerEvent) => void;
	onEnd: (reason: PointerSessionEndReason, event: PointerEvent | null) => void;
}): (() => void) => {
	const {pointerId} = event;
	const buttonMask = getButtonMask(event.button);
	let ended = false;

	const cleanup = () => {
		window.removeEventListener('pointermove', handleMove);
		window.removeEventListener('pointerup', handleUp);
		window.removeEventListener('pointercancel', handleCancel);
		window.removeEventListener('blur', handleBlur);
		document.removeEventListener('visibilitychange', handleVisibilityChange);
		captureTarget?.removeEventListener(
			'lostpointercapture',
			handleLostPointerCapture,
		);

		if (captureTarget?.hasPointerCapture?.(pointerId)) {
			try {
				captureTarget.releasePointerCapture(pointerId);
			} catch {
				// The browser may already have released capture.
			}
		}
	};

	const end = (
		reason: PointerSessionEndReason,
		pointerEvent: PointerEvent | null,
	) => {
		if (ended) {
			return;
		}

		ended = true;
		cleanup();
		onEnd(reason, pointerEvent);
	};

	function handleMove(moveEvent: PointerEvent) {
		if (moveEvent.pointerId !== pointerId) {
			return;
		}

		if ((moveEvent.buttons & buttonMask) === 0) {
			end('buttons-released', moveEvent);
			return;
		}

		onMove?.(moveEvent);
	}

	function handleUp(upEvent: PointerEvent) {
		if (upEvent.pointerId === pointerId) {
			end('pointerup', upEvent);
		}
	}

	function handleCancel(cancelEvent: PointerEvent) {
		if (cancelEvent.pointerId === pointerId) {
			end('pointercancel', cancelEvent);
		}
	}

	function handleLostPointerCapture(lostEvent: Event) {
		const pointerEvent = lostEvent as PointerEvent;
		if (pointerEvent.pointerId === pointerId) {
			end('lostpointercapture', pointerEvent);
		}
	}

	function handleBlur() {
		end('blur', null);
	}

	function handleVisibilityChange() {
		if (document.visibilityState === 'hidden') {
			end('visibilitychange', null);
		}
	}

	if (captureTarget) {
		try {
			captureTarget.setPointerCapture?.(pointerId);
		} catch {
			// Capture is best-effort for detached targets.
		}

		captureTarget.addEventListener(
			'lostpointercapture',
			handleLostPointerCapture,
		);
	}

	window.addEventListener('pointermove', handleMove);
	window.addEventListener('pointerup', handleUp);
	window.addEventListener('pointercancel', handleCancel);
	window.addEventListener('blur', handleBlur);
	document.addEventListener('visibilitychange', handleVisibilityChange);

	return () => end('manual', null);
};

// Use for a gesture owned by a Studio control, such as a slider or resize
// handle. `captureTarget` is normally the pointerdown handler's currentTarget.
export const startCapturedPointerSession = ({
	event,
	captureTarget,
	onMove,
	onEnd,
}: {
	event: PointerSessionEvent;
	captureTarget: Element;
	onMove?: (event: PointerEvent) => void;
	onEnd: (reason: PointerSessionEndReason, event: PointerEvent | null) => void;
}) => {
	return startPointerSession({event, captureTarget, onMove, onEnd});
};

// Use when observing a gesture that started elsewhere. This deliberately does
// not capture the pointer from the element under it.
export const observePointerRelease = ({
	event,
	onEnd,
}: {
	event: PointerSessionEvent;
	onEnd: (reason: PointerSessionEndReason, event: PointerEvent | null) => void;
}) => {
	return startPointerSession({
		event,
		captureTarget: null,
		onEnd,
	});
};
