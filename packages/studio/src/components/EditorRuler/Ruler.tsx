import type {Size} from '@remotion/player';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
} from 'react';
import {Internals} from 'remotion';
import {BACKGROUND, RULER_COLOR} from '../../helpers/colors';
import {getRulerGuideHighlight} from '../../helpers/editor-guide-selection';
import {drawMarkingOnRulerCanvas} from '../../helpers/editor-ruler';
import {getRulerCanvasSize} from '../../helpers/ruler-canvas-size';
import {EditorShowGuidesContext} from '../../state/editor-guides';
import {forceSpecificCursor} from '../ForceSpecificCursor';
import {PREVENT_CLEAR_SELECTION_ON_POINTER_DOWN_ATTR} from '../Timeline/should-clear-selection-on-pointer-down';
import {useTimelineSelection} from '../Timeline/TimelineSelection';

interface Point {
	value: number;
	position: number;
}

interface RulerProps {
	readonly scale: number;
	readonly points: Point[];
	readonly originOffset: number;
	readonly startMarking: number;
	readonly markingGaps: number;
	readonly orientation: 'horizontal' | 'vertical';
	readonly size: Size;
}

const makeGuideId = (): string => {
	return Math.random().toString(36).substring(7);
};

const Ruler: React.FC<RulerProps> = ({
	scale,
	points,
	originOffset,
	startMarking,
	size,
	markingGaps,
	orientation,
}) => {
	const rulerCanvasRef = useRef<HTMLCanvasElement | null>(null);
	const isVerticalRuler = orientation === 'vertical';
	const {
		shouldCreateGuideRef,
		setGuidesList,
		draggingGuideId,
		hoveredGuideId,
		setDraggingGuideId,
		guidesList,
		setEditorShowGuides,
	} = useContext(EditorShowGuidesContext);
	const {selectedItems} = useTimelineSelection();
	const unsafeVideoConfig = Internals.useUnsafeVideoConfig();

	if (!unsafeVideoConfig) {
		throw new Error('Video config not set');
	}

	const cursor = isVerticalRuler ? 'ew-resize' : 'ns-resize';

	const guideHighlight = useMemo(
		() =>
			getRulerGuideHighlight({
				guidesList,
				selectedItems,
				hoveredGuideId,
				draggingGuideId,
			}),
		[draggingGuideId, guidesList, hoveredGuideId, selectedItems],
	);

	const {width: rulerWidth, height: rulerHeight} = getRulerCanvasSize({
		orientation,
		size,
	});

	useEffect(() => {
		drawMarkingOnRulerCanvas({
			scale,
			points,
			startMarking,
			originOffset,
			markingGaps,
			orientation,
			rulerCanvasRef,
			guideHighlight,
			canvasHeight: rulerHeight * window.devicePixelRatio,
			canvasWidth: rulerWidth * window.devicePixelRatio,
		});
	}, [
		scale,
		points,
		startMarking,
		originOffset,
		markingGaps,
		orientation,
		guideHighlight,
		size,
		rulerHeight,
		rulerWidth,
	]);

	const rulerStyle: React.CSSProperties = useMemo(
		() => ({
			position: 'absolute',
			background: BACKGROUND,
			width: rulerWidth,
			height: rulerHeight,
			left: isVerticalRuler ? 0 : 'unset',
			top: isVerticalRuler ? 'unset' : 0,
			borderBottom: isVerticalRuler ? undefined : '1px solid ' + RULER_COLOR,
			borderRight: isVerticalRuler ? '1px solid ' + RULER_COLOR : undefined,
			cursor,
		}),
		[rulerWidth, rulerHeight, cursor, isVerticalRuler],
	);

	const onPointerDown: React.PointerEventHandler<HTMLCanvasElement> =
		useCallback(
			(e: React.PointerEvent<HTMLCanvasElement>) => {
				if (e.button !== 0) {
					return;
				}

				e.preventDefault();
				// Prevent deselection of currently selected items
				e.stopPropagation();
				shouldCreateGuideRef.current = true;
				forceSpecificCursor(cursor);
				const guideId = makeGuideId();
				setEditorShowGuides(() => true);
				setDraggingGuideId(() => guideId);
				setGuidesList((prevState) => {
					return [
						...prevState,
						{
							orientation,
							position: -originOffset,
							show: false,
							id: guideId,
							compositionId: unsafeVideoConfig.id,
						},
					];
				});
			},
			[
				shouldCreateGuideRef,
				setEditorShowGuides,
				setDraggingGuideId,
				setGuidesList,
				orientation,
				originOffset,
				unsafeVideoConfig.id,
				cursor,
			],
		);

	return (
		<canvas
			ref={rulerCanvasRef}
			width={rulerWidth * window.devicePixelRatio}
			height={rulerHeight * window.devicePixelRatio}
			style={rulerStyle}
			{...{[PREVENT_CLEAR_SELECTION_ON_POINTER_DOWN_ATTR]: 'true'}}
			onPointerDown={onPointerDown}
		/>
	);
};

export default Ruler;
