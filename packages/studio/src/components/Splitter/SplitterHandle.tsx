import {PlayerInternals} from '@remotion/player';
import React, {useContext, useEffect, useRef} from 'react';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from '../ForceSpecificCursor';
import {SplitterContext} from './SplitterContext';

export const SPLITTER_HANDLE_SIZE = 3;

const containerRow: React.CSSProperties = {
	height: SPLITTER_HANDLE_SIZE,
};

const containerColumn: React.CSSProperties = {
	width: SPLITTER_HANDLE_SIZE,
};

export const SplitterHandle: React.FC<{
	readonly allowToCollapse: 'right' | 'left' | 'none';
	readonly onCollapse: () => void;
}> = ({allowToCollapse, onCollapse}) => {
	const context = useContext(SplitterContext);
	if (!context) {
		throw new Error('Cannot find splitter context');
	}

	const ref = useRef<HTMLDivElement>(null);

	// Keep the latest props/context readable inside the long-lived pointerdown
	// listener without re-subscribing it on every render.
	const latest = useRef({context, allowToCollapse, onCollapse});
	latest.current = {context, allowToCollapse, onCollapse};

	useEffect(() => {
		const {current} = ref;
		if (!current) {
			return;
		}

		// Cleanup for the listeners that only exist for the duration of a drag.
		let endDrag: (() => void) | null = null;

		const onPointerDown = (e: PointerEvent) => {
			if (e.button !== 0) {
				return;
			}

			// Prevent deselection of currently selected items
			e.stopPropagation();

			// Capture the context and starting flex once, at drag start. The flex
			// value updates on every pointermove, so it must not be re-read live.
			const dragContext = latest.current.context;
			const start = {x: e.clientX, y: e.clientY};
			const {width: containerWidth, height: containerHeight} =
				dragContext.ref.current?.getBoundingClientRect() ?? {
					width: 0,
					height: 0,
				};
			const availableSize =
				(dragContext.orientation === 'vertical'
					? containerWidth
					: containerHeight) - SPLITTER_HANDLE_SIZE;
			const minFlex =
				dragContext.maxAntiFlexerSize === null || availableSize <= 0
					? dragContext.minFlex
					: Math.max(
							dragContext.minFlex,
							1 - dragContext.maxAntiFlexerSize / availableSize,
						);
			const maxFlex =
				dragContext.maxFlexerSize === null || availableSize <= 0
					? dragContext.maxFlex
					: Math.min(
							dragContext.maxFlex,
							dragContext.maxFlexerSize / availableSize,
						);
			const startFlex = Math.min(
				maxFlex,
				Math.max(minFlex, dragContext.flexValue),
			);

			dragContext.isDragging.current = start;
			forceSpecificCursor(
				dragContext.orientation === 'horizontal' ? 'row-resize' : 'col-resize',
			);
			current.classList.add('remotion-splitter-active');

			const getNewValue = (ev: PointerEvent, clamp: boolean) => {
				if (!dragContext.ref.current) {
					throw new Error('domRect is not mounted');
				}

				const {width, height} = dragContext.ref.current.getBoundingClientRect();
				const change =
					dragContext.orientation === 'vertical'
						? (ev.clientX - start.x) / (width - SPLITTER_HANDLE_SIZE)
						: (ev.clientY - start.y) / (height - SPLITTER_HANDLE_SIZE);

				const newFlex = startFlex + change;
				if (clamp) {
					return Math.min(maxFlex, Math.max(minFlex, newFlex));
				}

				return newFlex;
			};

			endDrag = () => {
				dragContext.isDragging.current = false;
				stopForcingSpecificCursor();
				current.classList.remove('remotion-splitter-active');
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
				window.removeEventListener('pointercancel', onPointerCancel);
				window.removeEventListener('blur', onWindowBlur);
				endDrag = null;
				PlayerInternals.updateAllElementsSizes();
			};

			const onPointerMove = (ev: PointerEvent) => {
				if (!dragContext.isDragging.current) {
					return;
				}

				dragContext.setFlexValue(getNewValue(ev, true));

				const collapse = latest.current.allowToCollapse;
				if (collapse === 'left') {
					const unclamped = getNewValue(ev, false);
					if (unclamped < dragContext.minFlex / 2) {
						endDrag?.();
						latest.current.onCollapse();
					}
				} else if (collapse === 'right') {
					const unclamped = 1 - getNewValue(ev, false);
					if (unclamped < (1 - dragContext.maxFlex) / 2) {
						endDrag?.();
						latest.current.onCollapse();
					}
				}
			};

			const onPointerUp = (ev: PointerEvent) => {
				if (!dragContext.isDragging.current) {
					return;
				}

				dragContext.persistFlex(getNewValue(ev, true));
				endDrag?.();
			};

			const onPointerCancel = () => {
				endDrag?.();
			};

			const onWindowBlur = () => {
				endDrag?.();
			};

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
			window.addEventListener('pointercancel', onPointerCancel);
			window.addEventListener('blur', onWindowBlur);
		};

		current.addEventListener('pointerdown', onPointerDown);

		return () => {
			current.removeEventListener('pointerdown', onPointerDown);
			endDrag?.();
		};
	}, []);

	useEffect(() => {
		const {current} = ref;
		if (!current) {
			return;
		}

		let isMouseDown = false;

		const onMouseDown = () => {
			isMouseDown = true;
		};

		const onMouseUp = () => {
			isMouseDown = false;
		};

		const onMouseEnter = (e: MouseEvent) => {
			if (e.button !== 0) {
				return;
			}

			if (isMouseDown) {
				return;
			}

			current.classList.add('remotion-splitter-hover');
		};

		const onMouseLeave = (e: MouseEvent) => {
			if (e.button !== 0) {
				return;
			}

			current.classList.remove('remotion-splitter-hover');
		};

		current.addEventListener('mouseenter', onMouseEnter);
		current.addEventListener('mouseleave', onMouseLeave);
		window.addEventListener('mousedown', onMouseDown);
		window.addEventListener('mouseup', onMouseUp);

		return () => {
			current.removeEventListener('mouseenter', onMouseEnter);
			current.removeEventListener('mouseleave', onMouseLeave);
			window.removeEventListener('mousedown', onMouseDown);
			window.removeEventListener('mouseup', onMouseUp);
		};
	}, []);

	return (
		<div
			ref={ref}
			className={[
				'remotion-splitter',
				context.orientation === 'horizontal'
					? 'remotion-splitter-horizontal'
					: 'remotion-splitter-vertical',
			].join(' ')}
			style={
				context.orientation === 'horizontal' ? containerRow : containerColumn
			}
		/>
	);
};
