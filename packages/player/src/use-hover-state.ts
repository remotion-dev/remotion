import {useEffect, useState} from 'react';
import {observeHover} from './observe-hover.js';

export const useHoverState = (
	ref: React.RefObject<HTMLElement | null>,
	hideControlsWhenPointerDoesntMove: boolean | number,
) => {
	const [hovered, setHovered] = useState(false);

	useEffect(() => {
		setHovered(false);
		const {current} = ref;
		if (!current) {
			return;
		}

		const {ownerDocument} = current;
		const ownerWindow = ownerDocument.defaultView;
		let stopTouchReveal: (() => void) | null = null;
		let hoverTimeout: Timer;
		const onLeave = () => {
			setHovered(false);
			clearTimeout(hoverTimeout);
			stopTouchReveal?.();
			stopTouchReveal = null;
		};

		const addHoverTimeout = () => {
			if (hideControlsWhenPointerDoesntMove) {
				clearTimeout(hoverTimeout);
				hoverTimeout = setTimeout(
					onLeave,
					hideControlsWhenPointerDoesntMove === true
						? 3000
						: hideControlsWhenPointerDoesntMove,
				);
			}
		};

		const onHover = () => {
			stopTouchReveal?.();
			stopTouchReveal = null;
			setHovered(true);
			addHoverTimeout();
		};

		const onVisibilityChange = () => {
			if (ownerDocument.hidden) {
				onLeave();
			}
		};

		// Touch does not hover, but a tap must still reveal the Player controls.
		// Keep them accessible until inactivity or another interaction dismisses them.
		const onPointerDown = (event: PointerEvent) => {
			if (!event.composedPath().includes(current)) {
				onLeave();
				return;
			}

			if (event.pointerType !== 'touch') {
				return;
			}

			onHover();
			ownerDocument.addEventListener('pointerdown', onPointerDown, true);
			ownerDocument.addEventListener('pointercancel', onLeave, true);
			ownerDocument.addEventListener('visibilitychange', onVisibilityChange);
			ownerWindow?.addEventListener('blur', onLeave);
			ownerWindow?.addEventListener(
				'remotion-browser-studio-pointerleave',
				onLeave,
			);
			stopTouchReveal = () => {
				ownerDocument.removeEventListener('pointerdown', onPointerDown, true);
				ownerDocument.removeEventListener('pointercancel', onLeave, true);
				ownerDocument.removeEventListener(
					'visibilitychange',
					onVisibilityChange,
				);
				ownerWindow?.removeEventListener('blur', onLeave);
				ownerWindow?.removeEventListener(
					'remotion-browser-studio-pointerleave',
					onLeave,
				);
			};
		};

		current.addEventListener('pointerdown', onPointerDown);
		const stopObserving = observeHover({
			element: current,
			onHoverChange: (isHovered) => {
				if (isHovered) {
					onHover();
					return;
				}

				if (stopTouchReveal === null) {
					onLeave();
				}
			},
			onPointerMove: onHover,
		});

		return () => {
			stopObserving();
			stopTouchReveal?.();
			current.removeEventListener('pointerdown', onPointerDown);
			clearTimeout(hoverTimeout);
		};
	}, [hideControlsWhenPointerDoesntMove, ref]);
	return hovered;
};
