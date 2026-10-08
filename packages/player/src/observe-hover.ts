// Browser Studio forwards exits from its iframe because browsers do not always
// dispatch a leave event on the element inside the frame.
const browserStudioPointerLeaveEvent = 'remotion-browser-studio-pointerleave';

export const observeHover = ({
	element,
	onHoverChange,
	onPointerMove,
}: {
	element: HTMLElement;
	onHoverChange: (hovered: boolean) => void;
	onPointerMove: (() => void) | null;
}): (() => void) => {
	const {ownerDocument} = element;
	const ownerWindow = ownerDocument.defaultView;
	let hovered = false;
	let disposed = false;
	let animationFrame: number | null = null;
	let removeGlobalListeners: (() => void) | null = null;

	const onLeave = () => {
		if (!hovered) {
			return;
		}

		hovered = false;
		if (animationFrame !== null) {
			ownerWindow?.cancelAnimationFrame(animationFrame);
			animationFrame = null;
		}

		removeGlobalListeners?.();
		removeGlobalListeners = null;
		if (!disposed) {
			onHoverChange(false);
		}
	};

	const onVisibilityChange = () => {
		if (ownerDocument.hidden) {
			onLeave();
		}
	};

	const onPointerCancel = (event: PointerEvent) => {
		if (event.pointerType !== 'touch') {
			onLeave();
		}
	};

	const onDocumentPointerOut = (event: PointerEvent) => {
		if (event.pointerType !== 'touch' && event.relatedTarget === null) {
			onLeave();
		}
	};

	const reconcileHover = () => {
		animationFrame = null;
		// CSS hover is maintained by the browser even when an element's leave
		// event is lost, or the layout changes underneath a stationary pointer.
		if (!element.isConnected || !element.matches(':hover')) {
			onLeave();
			return;
		}

		animationFrame = ownerWindow?.requestAnimationFrame(reconcileHover) ?? null;
	};

	const onPointerEnter = (event: PointerEvent) => {
		if (event.pointerType === 'touch' || hovered || disposed) {
			return;
		}

		hovered = true;
		ownerWindow?.addEventListener('blur', onLeave);
		ownerWindow?.addEventListener(browserStudioPointerLeaveEvent, onLeave);
		ownerDocument.addEventListener('visibilitychange', onVisibilityChange);
		ownerDocument.addEventListener('pointercancel', onPointerCancel, true);
		ownerDocument.addEventListener('pointerout', onDocumentPointerOut, true);
		removeGlobalListeners = () => {
			ownerWindow?.removeEventListener('blur', onLeave);
			ownerWindow?.removeEventListener(browserStudioPointerLeaveEvent, onLeave);
			ownerDocument.removeEventListener('visibilitychange', onVisibilityChange);
			ownerDocument.removeEventListener('pointercancel', onPointerCancel, true);
			ownerDocument.removeEventListener(
				'pointerout',
				onDocumentPointerOut,
				true,
			);
		};

		animationFrame = ownerWindow?.requestAnimationFrame(reconcileHover) ?? null;
		onHoverChange(true);
	};

	const onPointerLeave = (event: PointerEvent) => {
		if (event.pointerType !== 'touch') {
			onLeave();
		}
	};

	const onMove = (event: PointerEvent) => {
		if (event.pointerType === 'touch' || disposed) {
			return;
		}

		// Pointer capture redirects events and keeps :hover on the capture
		// target. Use the actual hit target before accepting captured movement.
		const target = event.target as Element;
		if (
			target.hasPointerCapture(event.pointerId) &&
			!element.contains(
				ownerDocument.elementFromPoint(event.clientX, event.clientY),
			)
		) {
			onLeave();
			return;
		}

		// A move also repairs a missing enter, for example after switching tabs.
		onPointerEnter(event);
		if (!disposed) {
			onPointerMove?.();
		}
	};

	element.addEventListener('pointerenter', onPointerEnter);
	element.addEventListener('pointerleave', onPointerLeave);
	element.addEventListener('pointermove', onMove);
	return () => {
		disposed = true;
		onLeave();
		element.removeEventListener('pointerenter', onPointerEnter);
		element.removeEventListener('pointerleave', onPointerLeave);
		element.removeEventListener('pointermove', onMove);
	};
};
