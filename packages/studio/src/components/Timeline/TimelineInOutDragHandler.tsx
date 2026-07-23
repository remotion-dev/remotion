import {PlayerInternals} from '@remotion/player';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {Internals, useVideoConfig} from 'remotion';
import {getXPositionOfItemInTimelineImperatively} from '../../helpers/get-left-of-timeline-slider';
import {
	useTimelineInOutFramePosition,
	useTimelineSetInOutFramePosition,
} from '../../state/in-out';
import {useZIndex} from '../../state/z-index';
import {ContextMenu} from '../ContextMenu';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from '../ForceSpecificCursor';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {defaultInOutValue} from '../TimelineInOutToggle';
import {scrollableRef} from './timeline-refs';
import {getFrameFromX} from './timeline-scroll-logic';
import {inMarkerAreaRef, outMarkerAreaRef} from './TimelineInOutPointer';
import {
	TimelineInOutPointerHandle,
	inPointerHandle,
	outPointerHandle,
} from './TimelineInOutPointerHandle';
import {TimelineWidthContext} from './TimelineWidthProvider';

const getClientXWithScroll = (x: number) => {
	return x + (scrollableRef.current?.scrollLeft as number);
};

export const TimelineInOutDragHandler: React.FC = () => {
	const video = Internals.useUnsafeVideoConfig();
	const {canvasContent} = useContext(Internals.CompositionManager);

	if (!canvasContent || canvasContent.type !== 'composition') {
		return null;
	}

	return video ? <TimelineInOutDragHandlerInnerMemo /> : null;
};

const TimelineInOutDragHandlerInner: React.FC = () => {
	const videoConfig = useVideoConfig();
	const size = PlayerInternals.useElementSize(scrollableRef, {
		triggerOnWindowResize: true,
		shouldApplyCssTransforms: true,
	});
	const {isHighestContext} = useZIndex();

	const [inOutDragging, setInOutDragging] = useState<
		| {
				dragging: false;
		  }
		| {
				dragging: 'in' | 'out';
				initialOffset: number;
				boundaries: [number, number];
		  }
	>({
		dragging: false,
	});

	const timelineWidth = useContext(TimelineWidthContext);

	const get = useCallback(
		(frame: number) => {
			if (timelineWidth === null) {
				throw new Error('timeline width is not yet determined');
			}

			return getXPositionOfItemInTimelineImperatively(
				frame,
				videoConfig.durationInFrames,
				timelineWidth,
			);
		},
		[timelineWidth, videoConfig.durationInFrames],
	);

	const width = scrollableRef.current?.scrollWidth ?? 0;
	const left = size?.left ?? 0;

	const {inFrame, outFrame} = useTimelineInOutFramePosition();

	const {setInAndOutFrames} = useTimelineSetInOutFramePosition();

	const onInPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (e.button !== 0) {
				return;
			}

			if (!isHighestContext) {
				return;
			}

			if (!videoConfig) {
				return;
			}

			if (inFrame === null) {
				throw new Error('expected in frame');
			}

			e.stopPropagation();

			document.body.style.userSelect = 'none';
			document.body.style.webkitUserSelect = 'none';

			const inMarker = get(inFrame);
			const outMarker = outFrame === null ? Infinity : get(outFrame - 1);
			forceSpecificCursor('ew-resize');
			setInOutDragging({
				dragging: 'in',
				initialOffset: getClientXWithScroll(e.clientX),
				boundaries: [-Infinity, outMarker - inMarker],
			});
		},
		[isHighestContext, videoConfig, inFrame, get, outFrame],
	);

	const onOutPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (e.button !== 0) {
				return;
			}

			if (!isHighestContext) {
				return;
			}

			if (!videoConfig) {
				return;
			}

			if (outFrame === null) {
				throw new Error('expected out frame');
			}

			e.stopPropagation();

			document.body.style.userSelect = 'none';
			document.body.style.webkitUserSelect = 'none';

			const outMarker = get(outFrame);
			const inMarker = inFrame === null ? -Infinity : get(inFrame + 1);
			forceSpecificCursor('ew-resize');
			setInOutDragging({
				dragging: 'out',
				initialOffset: getClientXWithScroll(e.clientX),
				boundaries: [inMarker - outMarker, Infinity],
			});
		},
		[isHighestContext, videoConfig, inFrame, get, outFrame],
	);

	const onPointerMoveInOut = useCallback(
		(e: PointerEvent) => {
			if (!videoConfig) {
				return;
			}

			if (!inOutDragging.dragging) {
				return;
			}

			const offset = Math.max(
				inOutDragging.boundaries[0],
				Math.min(
					inOutDragging.boundaries[1],
					getClientXWithScroll(e.clientX) - inOutDragging.initialOffset,
				),
			);
			if (inOutDragging.dragging === 'in') {
				if (!inPointerHandle.current) {
					throw new Error('in pointer handle');
				}

				if (!inMarkerAreaRef.current) {
					throw new Error('expected inMarkerAreaRef');
				}

				if (!inFrame) {
					throw new Error('expected inframes');
				}

				inPointerHandle.current.style.transform = `translateX(${
					get(inFrame) + offset
				}px)`;
				inMarkerAreaRef.current.style.width =
					String(get(inFrame) + offset) + 'px';
			}

			if (inOutDragging.dragging === 'out') {
				if (!outPointerHandle.current) {
					throw new Error('in pointer handle');
				}

				if (!outMarkerAreaRef.current) {
					throw new Error('in outMarkerAreaRef');
				}

				if (!outFrame) {
					throw new Error('expected outframes');
				}

				outPointerHandle.current.style.transform = `translateX(${
					get(outFrame) + offset
				}px)`;
				outMarkerAreaRef.current.style.left =
					String(get(outFrame) + offset) + 'px';
				outMarkerAreaRef.current.style.width =
					String(width - get(outFrame) - offset) + 'px';
			}
		},
		[get, inFrame, inOutDragging, outFrame, videoConfig, width],
	);

	const onPointerUpInOut = useCallback(
		(e: PointerEvent) => {
			document.body.style.userSelect = '';
			document.body.style.webkitUserSelect = '';
			stopForcingSpecificCursor();

			if (!videoConfig) {
				return;
			}

			if (!inOutDragging.dragging) {
				return;
			}

			setInOutDragging({
				dragging: false,
			});

			const frame = getFrameFromX({
				clientX: getClientXWithScroll(e.clientX) - left,
				durationInFrames: videoConfig.durationInFrames,
				width,
				extrapolate: 'extend',
			});
			if (inOutDragging.dragging === 'in') {
				if (frame < 1) {
					return setInAndOutFrames((prev) => ({
						...prev,
						[videoConfig.id]: {
							...(prev[videoConfig.id] ?? defaultInOutValue),
							inFrame: null,
						},
					}));
				}

				const maxFrame = outFrame === null ? Infinity : outFrame - 1;
				setInAndOutFrames((prev) => ({
					...prev,
					[videoConfig.id]: {
						...(prev[videoConfig.id] ?? defaultInOutValue),
						inFrame: Math.min(maxFrame, frame),
					},
				}));
			} else {
				if (frame > videoConfig.durationInFrames - 2) {
					return setInAndOutFrames((prev) => ({
						...prev,
						[videoConfig.id]: {
							...(prev[videoConfig.id] ?? defaultInOutValue),
							outFrame: null,
						},
					}));
				}

				const minFrame = inFrame === null ? -Infinity : inFrame + 1;
				setInAndOutFrames((prev) => ({
					...prev,
					[videoConfig.id]: {
						...(prev[videoConfig.id] ?? defaultInOutValue),
						outFrame: Math.max(minFrame, frame),
					},
				}));
			}
		},
		[
			inFrame,
			inOutDragging.dragging,
			left,
			outFrame,
			setInAndOutFrames,
			videoConfig,
			width,
		],
	);

	const onPointerCancelInOut = useCallback(() => {
		document.body.style.userSelect = '';
		document.body.style.webkitUserSelect = '';
		stopForcingSpecificCursor();
		setInOutDragging({
			dragging: false,
		});
	}, []);

	useEffect(() => {
		if (inOutDragging.dragging === false) {
			return;
		}

		window.addEventListener('pointermove', onPointerMoveInOut);
		window.addEventListener('pointerup', onPointerUpInOut);
		window.addEventListener('pointercancel', onPointerCancelInOut);
		window.addEventListener('blur', onPointerCancelInOut);
		return () => {
			window.removeEventListener('pointermove', onPointerMoveInOut);
			window.removeEventListener('pointerup', onPointerUpInOut);
			window.removeEventListener('pointercancel', onPointerCancelInOut);
			window.removeEventListener('blur', onPointerCancelInOut);
		};
	}, [
		inOutDragging.dragging,
		onPointerCancelInOut,
		onPointerMoveInOut,
		onPointerUpInOut,
	]);

	useEffect(() => {
		return () => {
			document.body.style.userSelect = '';
			document.body.style.webkitUserSelect = '';
			stopForcingSpecificCursor();
		};
	}, []);

	const inContextMenu = useMemo((): ComboboxValue[] => {
		return [
			{
				id: 'hide-in',
				keyHint: null,
				label: 'Clear In marker',
				leftItem: null,
				onClick: (_, e) => {
					e?.stopPropagation();
					e?.preventDefault();
					setInAndOutFrames((prev) => ({
						...prev,
						[videoConfig.id]: {
							...(prev[videoConfig.id] ?? defaultInOutValue),
							inFrame: null,
						},
					}));
				},
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: 'hide-in',
			},
		];
	}, [setInAndOutFrames, videoConfig.id]);

	const outContextMenu = useMemo((): ComboboxValue[] => {
		return [
			{
				id: 'hide-out',
				keyHint: null,
				label: 'Clear Out marker',
				leftItem: null,
				onClick: (_, e) => {
					e?.stopPropagation();
					e?.preventDefault();
					setInAndOutFrames((prev) => ({
						...prev,
						[videoConfig.id]: {
							...(prev[videoConfig.id] ?? defaultInOutValue),
							outFrame: null,
						},
					}));
				},
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: 'hide-out',
			},
		];
	}, [setInAndOutFrames, videoConfig.id]);

	return (
		<>
			{inFrame !== null && (
				<ContextMenu values={inContextMenu} onOpen={null}>
					<TimelineInOutPointerHandle
						type="in"
						atFrame={inFrame}
						dragging={inOutDragging.dragging === 'in'}
						onPointerDown={onInPointerDown}
					/>
				</ContextMenu>
			)}
			{outFrame !== null && (
				<ContextMenu values={outContextMenu} onOpen={null}>
					<TimelineInOutPointerHandle
						type="out"
						dragging={inOutDragging.dragging === 'out'}
						atFrame={outFrame}
						onPointerDown={onOutPointerDown}
					/>
				</ContextMenu>
			)}
		</>
	);
};

const TimelineInOutDragHandlerInnerMemo = React.memo(
	TimelineInOutDragHandlerInner,
);
