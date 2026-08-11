import {PlayerInternals} from '@remotion/player';
import React, {useContext, useEffect, useRef} from 'react';
import {startPointerSession} from '../../helpers/pointer-session';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from '../ForceSpecificCursor';
import {getSplitterFlexBounds, SplitterContext} from './SplitterContext';

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

			endDrag = startPointerSession({
				event: e,
				target: current,
				onMove: onPointerMove,
				onEnd: (reason, endEvent) => {
					if (
						(reason === 'pointerup' || reason === 'buttons-released') &&
						endEvent &&
						dragContext.isDragging.current
					) {
						dragContext.persistFlex(getNewValue(endEvent, true));
					}

					dragContext.isDragging.current = false;
					stopForcingSpecificCursor();
					endDrag = null;
					PlayerInternals.updateAllElementsSizes();
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
				context.orientation === 'horizontal' ? containerRow : containerColumn
			}
		/>
	);
};
