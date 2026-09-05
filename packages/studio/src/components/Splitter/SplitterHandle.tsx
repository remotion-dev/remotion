import React, {useContext, useEffect, useRef} from 'react';
import {startCapturedPointerSession} from '../../helpers/pointer-session';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from '../ForceSpecificCursor';
import {getSplitterFlexBounds, SplitterContext} from './SplitterContext';

export const SPLITTER_HANDLE_SIZE = 3;

const containerRow: React.CSSProperties = {
	height: SPLITTER_HANDLE_SIZE,
};

const collapsedContainer: React.CSSProperties = {
	width: 0,
	height: 0,
};

const containerColumn: React.CSSProperties = {
	width: SPLITTER_HANDLE_SIZE,
};

export const SplitterHandle: React.FC<{
	readonly allowToCollapse: 'right' | 'left' | 'none';
	readonly onCollapse: () => void;
	readonly onCollapseDuringDrag:
		| ((side: 'left' | 'right' | null) => void)
		| null;
}> = ({allowToCollapse, onCollapse, onCollapseDuringDrag}) => {
	const context = useContext(SplitterContext);
	if (!context) {
		throw new Error('Cannot find splitter context');
	}

	const ref = useRef<HTMLDivElement>(null);

	// Keep the latest props/context readable inside the long-lived pointerdown
	// listener without re-subscribing it on every render.
	const latest = useRef({
		context,
		allowToCollapse,
		onCollapse,
		onCollapseDuringDrag,
	});
	latest.current = {context, allowToCollapse, onCollapse, onCollapseDuringDrag};

	useEffect(() => {
		const {current} = ref;
		if (!current) {
			return;
		}

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
			const {minFlex, maxFlex} = getSplitterFlexBounds({
				availableSize,
				maxAntiFlexerSize: dragContext.maxAntiFlexerSize,
				maxFlex: dragContext.maxFlex,
				maxFlexerSize: dragContext.maxFlexerSize,
				minAntiFlexerSize: dragContext.minAntiFlexerSize,
				minFlex: dragContext.minFlex,
				minFlexerSize: dragContext.minFlexerSize,
			});
			const startFlex = Math.min(
				maxFlex,
				Math.max(minFlex, dragContext.flexValue),
			);

			dragContext.isDragging.current = start;
			forceSpecificCursor(
				dragContext.orientation === 'horizontal' ? 'row-resize' : 'col-resize',
			);

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

			const getCollapsedSide = (ev: PointerEvent) => {
				const collapse = latest.current.allowToCollapse;
				const unclamped = getNewValue(ev, false);
				if (collapse === 'left' && unclamped < dragContext.minFlex / 2) {
					return 'left';
				}

				if (
					collapse === 'right' &&
					1 - unclamped < (1 - dragContext.maxFlex) / 2
				) {
					return 'right';
				}

				return null;
			};

			let lastFlex = startFlex;
			let lastCollapsedSide: 'left' | 'right' | null = null;

			const onPointerMove = (ev: PointerEvent) => {
				if (!dragContext.isDragging.current) {
					return;
				}

				// Keep the handle mounted and captured until release, even while
				// the panel is hidden, so moving inward can restore it.
				lastCollapsedSide = getCollapsedSide(ev);
				lastFlex = getNewValue(ev, true);
				latest.current.onCollapseDuringDrag?.(lastCollapsedSide);

				dragContext.setCollapsedDuringDrag(lastCollapsedSide);
				dragContext.setFlexValue(lastFlex);
			};

			endDrag = startCapturedPointerSession({
				event: e,
				captureTarget: current,
				onMove: onPointerMove,
				onEnd: (reason, endEvent) => {
					if (
						(reason === 'pointerup' || reason === 'buttons-released') &&
						endEvent
					) {
						lastFlex = getNewValue(endEvent, true);
						lastCollapsedSide = getCollapsedSide(endEvent);
					}

					// Capture loss and cancellation may have no usable coordinates.
					// Commit the last displayed state instead of resetting the panel.
					if (reason !== 'manual' && dragContext.isDragging.current) {
						const savedFlex = lastCollapsedSide === null ? lastFlex : startFlex;
						dragContext.setFlexValue(savedFlex);
						dragContext.persistFlex(savedFlex);
						if (lastCollapsedSide !== null) {
							latest.current.onCollapse();
						}
					}

					latest.current.onCollapseDuringDrag?.(null);

					dragContext.setCollapsedDuringDrag(null);
					dragContext.isDragging.current = false;
					stopForcingSpecificCursor();
					endDrag = null;
				},
			});
		};

		current.addEventListener('pointerdown', onPointerDown);

		return () => {
			current.removeEventListener('pointerdown', onPointerDown);
			endDrag?.();
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
				context.collapsedDuringDrag !== null
					? collapsedContainer
					: context.orientation === 'horizontal'
						? containerRow
						: containerColumn
			}
		/>
	);
};
