import {type Size} from '@remotion/player';
import React, {
	useCallback,
	useContext,
	useLayoutEffect,
	useMemo,
	useRef,
} from 'react';
import {BACKGROUND, RULER_COLOR} from '../../helpers/colors';
import {getRulerPoints, getRulerScaleRange} from '../../helpers/editor-ruler';
import type {AssetMetadata} from '../../helpers/get-asset-metadata';
import type {Dimensions} from '../../helpers/is-current-selected-still';
import {startPointerSession} from '../../helpers/pointer-session';
import {useStudioCanvasDimensions} from '../../helpers/use-studio-canvas-dimensions';
import {
	EditorShowGuidesContext,
	persistGuidesList,
} from '../../state/editor-guides';
import {
	MAXIMUM_PREDEFINED_RULER_SCALE_GAP,
	MINIMUM_RULER_MARKING_GAP_PX,
	PREDEFINED_RULER_SCALE_GAPS,
	RULER_WIDTH,
} from '../../state/editor-rulers';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from '../ForceSpecificCursor';
import {useTimelineSelection} from '../Timeline/TimelineSelection';
import Ruler from './Ruler';

const originBlockStyles: React.CSSProperties = {
	position: 'absolute',
	top: 0,
	left: 0,
	borderBottom: '1px solid ' + RULER_COLOR,
	borderRight: '1px solid ' + RULER_COLOR,
	width: `${RULER_WIDTH}px`,
	height: `${RULER_WIDTH}px`,
	background: BACKGROUND,
};

export const EditorRulers: React.FC<{
	readonly canvasSize: Size;
	readonly contentDimensions: Dimensions | 'none' | null;
	readonly assetMetadata: AssetMetadata | null;
	readonly containerRef: React.RefObject<HTMLDivElement | null>;
}> = ({contentDimensions, canvasSize, assetMetadata, containerRef}) => {
	const {scale, canvasPosition} = useStudioCanvasDimensions({
		canvasSize,
		contentDimensions,
		assetMetadata,
	});

	const {
		shouldCreateGuideRef,
		shouldDeleteGuideRef,
		setGuidesList,
		draggingGuideId,
		moveGuidePointerRef,
		setDraggingGuideId,
	} = useContext(EditorShowGuidesContext);
	const {clearSelection, selectedItems} = useTimelineSelection();

	const rulerMarkingGaps = useMemo(() => {
		const minimumGap = MINIMUM_RULER_MARKING_GAP_PX;
		const predefinedGap = PREDEFINED_RULER_SCALE_GAPS.find(
			(gap) => gap * scale > minimumGap,
		);

		return predefinedGap || MAXIMUM_PREDEFINED_RULER_SCALE_GAP;
	}, [scale]);

	const horizontalRulerScaleRange = useMemo(
		() =>
			getRulerScaleRange({
				canvasLength: canvasPosition.width,
				scale,
				canvasSize,
			}),
		[canvasPosition.width, canvasSize, scale],
	);

	const verticalRulerScaleRange = useMemo(
		() =>
			getRulerScaleRange({
				canvasLength: canvasPosition.height,
				scale,
				canvasSize,
			}),
		[canvasPosition.height, canvasSize, scale],
	);

	const {
		points: horizontalRulerPoints,
		startMarking: horizontalRulerStartMarking,
	} = useMemo(
		() =>
			getRulerPoints({
				rulerScaleRange: horizontalRulerScaleRange,
				rulerMarkingGaps,
				scale,
			}),
		[horizontalRulerScaleRange, rulerMarkingGaps, scale],
	);

	const {points: verticalRulerPoints, startMarking: verticalRulerStartMarking} =
		useMemo(
			() =>
				getRulerPoints({
					rulerScaleRange: verticalRulerScaleRange,
					rulerMarkingGaps,
					scale,
				}),
			[verticalRulerScaleRange, rulerMarkingGaps, scale],
		);

	const requestAnimationFrameRef = useRef<number | null>(null);

	const onMouseMove = useCallback(
		(e: PointerEvent, guideId: string | null) => {
			if (requestAnimationFrameRef.current) {
				cancelAnimationFrame(requestAnimationFrameRef.current);
			}

			requestAnimationFrameRef.current = requestAnimationFrame(() => {
				const {clientX: mouseX, clientY: mouseY} = e;
				const {
					left: containerLeft = 0,
					top: containerTop = 0,
					right: containerRight = 0,
					bottom: containerBottom = 0,
				} = containerRef.current?.getBoundingClientRect() || {};
				if (
					mouseX < containerLeft ||
					mouseX > containerRight ||
					mouseY < containerTop ||
					mouseY > containerBottom
				) {
					if (!shouldDeleteGuideRef.current) {
						shouldDeleteGuideRef.current = true;
					}

					setGuidesList((prevState) => {
						const newGuides = prevState.map((guide) => {
							if (guide.id !== guideId) {
								return guide;
							}

							const desiredCursor =
								guide.orientation === 'vertical' ? 'ew-resize' : 'ns-resize';
							forceSpecificCursor(desiredCursor);

							return {
								...guide,
								show: false,
							};
						});
						persistGuidesList(newGuides);
						return newGuides;
					});
				} else {
					if (shouldDeleteGuideRef.current) {
						shouldDeleteGuideRef.current = false;
					}

					setGuidesList((prevState) => {
						// Intentionally no persist, only persist on mouse up
						return prevState.map((guide) => {
							if (guide.id !== guideId) {
								return guide;
							}

							const position =
								guide.orientation === 'vertical'
									? (mouseX - containerLeft) / scale -
										canvasPosition.left / scale
									: (mouseY - containerTop) / scale -
										canvasPosition.top / scale;

							const desiredCursor =
								guide.orientation === 'vertical' ? 'ew-resize' : 'ns-resize';
							forceSpecificCursor(desiredCursor);

							return {
								...guide,
								position: Math.floor(position / 1.0),
								show: true,
							};
						});
					});
				}
			});
		},
		[
			containerRef,
			shouldDeleteGuideRef,
			setGuidesList,
			scale,
			canvasPosition.left,
			canvasPosition.top,
		],
	);

	const finishGuideInteraction = useCallback(
		(guideId: string) => {
			if (requestAnimationFrameRef.current) {
				cancelAnimationFrame(requestAnimationFrameRef.current);
				requestAnimationFrameRef.current = null;
			}

			const shouldDeleteGuide = shouldDeleteGuideRef.current;

			setGuidesList((prevState) => {
				const newGuides = prevState.filter((selected) => {
					if (!shouldDeleteGuide) {
						return true;
					}

					return selected.id !== guideId;
				});
				persistGuidesList(newGuides);
				return newGuides;
			});

			const deletedGuideWasSelected = selectedItems.some(
				(item) => item.type === 'guide' && item.guideId === guideId,
			);
			if (shouldDeleteGuide && deletedGuideWasSelected) {
				clearSelection();
			}

			shouldDeleteGuideRef.current = false;
			stopForcingSpecificCursor();
			shouldCreateGuideRef.current = false;
			setDraggingGuideId(() => null);
		},
		[
			clearSelection,
			shouldCreateGuideRef,
			shouldDeleteGuideRef,
			setDraggingGuideId,
			setGuidesList,
			selectedItems,
		],
	);

	useLayoutEffect(() => {
		moveGuidePointerRef.current = (event) => {
			onMouseMove(event, draggingGuideId);
		};

		return () => {
			moveGuidePointerRef.current = null;
			if (requestAnimationFrameRef.current) {
				cancelAnimationFrame(requestAnimationFrameRef.current);
			}
		};
	}, [draggingGuideId, moveGuidePointerRef, onMouseMove]);

	const onPointerSessionStart = useCallback(
		(event: React.PointerEvent<HTMLCanvasElement>, guideId: string) => {
			startPointerSession({
				event: event.nativeEvent,
				target: event.currentTarget,
				onMove: (moveEvent) => onMouseMove(moveEvent, guideId),
				onEnd: () => finishGuideInteraction(guideId),
			});
		},
		[finishGuideInteraction, onMouseMove],
	);

	return (
		<>
			<div style={originBlockStyles} />
			<Ruler
				orientation="horizontal"
				scale={scale}
				points={horizontalRulerPoints}
				startMarking={horizontalRulerStartMarking}
				markingGaps={rulerMarkingGaps}
				originOffset={canvasPosition.left}
				size={canvasSize}
				onPointerSessionStart={onPointerSessionStart}
			/>
			<Ruler
				orientation="vertical"
				scale={scale}
				points={verticalRulerPoints}
				startMarking={verticalRulerStartMarking}
				markingGaps={rulerMarkingGaps}
				originOffset={canvasPosition.top}
				size={canvasSize}
				onPointerSessionStart={onPointerSessionStart}
			/>
		</>
	);
};
