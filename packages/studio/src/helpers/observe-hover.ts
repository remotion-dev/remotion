export const observeHover = ({
	element,
	onHoverChange,
}: {
	element: HTMLElement;
	onHoverChange: (hovered: boolean) => void;
}): (() => void) => {
	const {ownerDocument} = element;
	const ownerWindow = ownerDocument.defaultView;
	let hovered = false;
	let globalListeners: AbortController | null = null;

	const onLeave = () => {
		if (!hovered) {
			return;
		}

		hovered = false;
		globalListeners?.abort();
		globalListeners = null;
		onHoverChange(false);
	};

	const onVisibilityChange = () => {
		if (ownerDocument.hidden) {
			onLeave();
		}
	};

	const onPointerLeave = (event: PointerEvent) => {
		if (event.pointerType !== 'touch') {
			onLeave();
		}
	};

	const onPointerOver = (event: PointerEvent) => {
		// Recover if the previous target never received its leave event.
		if (!event.composedPath().includes(element)) {
			onPointerLeave(event);
		}
	};

	const onPointerOut = (event: PointerEvent) => {
		if (event.relatedTarget === null) {
			onPointerLeave(event);
		}
	};

	const onPointerEnter = (event: PointerEvent) => {
		if (event.pointerType === 'touch' || hovered) {
			return;
		}

		hovered = true;
		globalListeners = new AbortController();
		const options = {capture: true, signal: globalListeners.signal};
		ownerDocument.addEventListener('pointerover', onPointerOver, options);
		ownerDocument.addEventListener('pointerout', onPointerOut, options);
		ownerDocument.addEventListener('pointercancel', onPointerLeave, options);
		ownerDocument.addEventListener(
			'visibilitychange',
			onVisibilityChange,
			options,
		);
		ownerWindow?.addEventListener('blur', onLeave, options);
		// Browser Studio forwards iframe exits when the inner leave is lost.
		ownerWindow?.addEventListener(
			'remotion-browser-studio-pointerleave',
			onLeave,
			options,
		);
		onHoverChange(true);
	};

	element.addEventListener('pointerenter', onPointerEnter);
	element.addEventListener('pointerleave', onPointerLeave);
	// Recover entry after a window blur or a missed enter event.
	element.addEventListener('pointermove', onPointerEnter);
	return () => {
		globalListeners?.abort();
		element.removeEventListener('pointerenter', onPointerEnter);
		element.removeEventListener('pointerleave', onPointerLeave);
		element.removeEventListener('pointermove', onPointerEnter);
	};
};
