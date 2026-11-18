import React, {
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
} from 'react';
import {FOCUS_VISIBLE_ONLY_CLASS_NAME} from '../../helpers/hoverable';
import {
	isPointerSessionRelease,
	startCapturedPointerSession,
} from '../../helpers/pointer-session';
import {useZIndex} from '../../state/z-index';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from '../ForceSpecificCursor';
import {getSplitterFlexBounds, SplitterContext} from './SplitterContext';
import {SplitterImperativeContext} from './SplitterImperativeContext';
import type {SplitterState} from './SplitterImperativeContext';

export const SPLITTER_HANDLE_SIZE = 1;

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
	readonly label: string | null;
	readonly allowToCollapse: 'right' | 'left' | 'none';
	readonly onCollapse: () => void;
	readonly onCollapseDuringDrag:
		| ((side: 'left' | 'right' | null) => void)
		| null;
}> = ({label, allowToCollapse, onCollapse, onCollapseDuringDrag}) => {
	const context = useContext(SplitterContext);
	const {registerSplitter} = useContext(SplitterImperativeContext);
	const {tabIndex} = useZIndex();
	if (!context) {
		throw new Error('Cannot find splitter context');
	}

	const ref = useRef<HTMLDivElement>(null);

	// Keep the latest props/context readable inside the long-lived pointerdown
	// listener without re-subscribing it on every render.
	const latest = useRef({
		context,
		label,
		allowToCollapse,
		onCollapse,
		onCollapseDuringDrag,
	});
	latest.current = {
		context,
		label,
		allowToCollapse,
		onCollapse,
		onCollapseDuringDrag,
	};

	const getState = useCallback((): SplitterState | null => {
		const {current} = latest;
		if (current.label === null || !ref.current?.isConnected) {
			return null;
		}

		const position = current.context.getPosition();
		return position === null
			? null
			: {
					...position,
					id: current.context.id,
					label: current.label,
					orientation: current.context.orientation,
					isDragging: current.context.isDragging.current !== false,
				};
	}, []);
	const setPosition = useCallback(
		(positionInPixels: number): SplitterState => {
			const state = getState();
			if (state === null) {
				throw new Error('Splitter is unavailable.');
			}

			return {
				...state,
				...latest.current.context.setPosition(positionInPixels),
			};
		},
		[getState],
	);

	useLayoutEffect(() => {
		if (label === null) {
			return;
		}

		return registerSplitter(context.id, {getState, setPosition});
	}, [context.id, getState, label, registerSplitter, setPosition]);

	const onKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLDivElement>) => {
			const {current} = latest;
			if (current.label === null) {
				return;
			}

			const decrease =
				current.context.orientation === 'horizontal' ? 'ArrowUp' : 'ArrowLeft';
			const increase =
				current.context.orientation === 'horizontal'
					? 'ArrowDown'
					: 'ArrowRight';
			if (
				event.key !== decrease &&
				event.key !== increase &&
				event.key !== 'Home' &&
				event.key !== 'End'
			) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			if (
				current.context.isDragging.current ||
				event.metaKey ||
				event.ctrlKey ||
				event.altKey
			) {
				return;
			}

			const position = current.context.getPosition();
			if (position === null) {
				return;
			}

			const step = event.shiftKey ? 10 : 1;
			current.context.setPosition(
				event.key === 'Home'
					? position.minPositionInPixels
					: event.key === 'End'
						? position.maxPositionInPixels
						: position.positionInPixels +
							(event.key === decrease ? -step : step),
			);
		},
		[],
	);

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
					if (isPointerSessionRelease(reason, endEvent)) {
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
			role={label === null ? undefined : 'separator'}
			aria-hidden={label === null ? true : undefined}
			aria-label={label ?? undefined}
			aria-controls={label === null ? undefined : context.firstPaneId}
			aria-orientation={label === null ? undefined : context.orientation}
			aria-valuenow={
				label === null ? undefined : context.position?.positionInPixels
			}
			aria-valuemin={
				label === null ? undefined : context.position?.minPositionInPixels
			}
			aria-valuemax={
				label === null ? undefined : context.position?.maxPositionInPixels
			}
			aria-valuetext={
				label === null || context.position === null
					? undefined
					: `${context.position.positionInPixels} pixels`
			}
			tabIndex={label === null ? undefined : tabIndex}
			onKeyDown={onKeyDown}
			className={[
				'remotion-splitter',
				FOCUS_VISIBLE_ONLY_CLASS_NAME,
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
