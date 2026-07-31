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

export const startPointerSession = ({
	event,
	target,
	onMove,
	onEnd,
}: {
	event: PointerSessionEvent;
	target: Element;
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
		target.removeEventListener('lostpointercapture', handleLostPointerCapture);

		if (target.hasPointerCapture?.(pointerId)) {
			try {
				target.releasePointerCapture(pointerId);
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

	try {
		target.setPointerCapture?.(pointerId);
	} catch {
		// Capture is best-effort for detached or browser-owned targets.
	}

	window.addEventListener('pointermove', handleMove);
	window.addEventListener('pointerup', handleUp);
	window.addEventListener('pointercancel', handleCancel);
	window.addEventListener('blur', handleBlur);
	document.addEventListener('visibilitychange', handleVisibilityChange);
	target.addEventListener('lostpointercapture', handleLostPointerCapture);

	return () => end('manual', null);
};
