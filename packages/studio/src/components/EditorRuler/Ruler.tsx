import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {BACKGROUND, RULER_COLOR} from '../../helpers/colors';
import {drawMarkingOnRulerCanvas} from '../../helpers/editor-ruler';
import {EditorShowGuidesContext} from '../../state/editor-guides';
import {RULER_WIDTH} from '../../state/editor-rulers';

interface Point {
	value: number;
	position: number;
}

interface RulerProps {
	scale: number;
	points: Point[];
	originOffset: number;
	startMarking: number;
	containerRef: React.RefObject<HTMLDivElement>;
	markingGaps: number;
	orientation: 'horizontal' | 'vertical';
}

const makeGuideId = (): string => {
	return Math.random().toString(36).substring(7);
};

const Ruler: React.FC<RulerProps> = ({
	scale,
	points,
	originOffset,
	startMarking,
	containerRef,
	markingGaps,
	orientation,
}) => {
	const rulerCanvasRef = useRef<HTMLCanvasElement | null>(null);
	const isVerticalRuler = orientation === 'vertical';
	const {
		shouldCreateGuideRef,
		setGuidesList,
		selectedGuideId,
		hoveredGuideId,
		setSelectedGuideId,
		guidesList,
		setEditorShowGuides,
	} = useContext(EditorShowGuidesContext);
	const unsafeVideoConfig = Internals.useUnsafeVideoConfig();

	if (!unsafeVideoConfig) {
		throw new Error('Video config not set');
	}

	const [cursor, setCursor] = useState<'ew-resize' | 'ns-resize' | 'no-drop'>(
		isVerticalRuler ? 'ew-resize' : 'ns-resize',
	);

	const selectedOrHoveredGuide = useMemo(() => {
		return (
			guidesList.find((guide) => guide.id === selectedGuideId) ??
			guidesList.find((guide) => guide.id === hoveredGuideId) ??
			null
		);
	}, [guidesList, hoveredGuideId, selectedGuideId]);

	useEffect(() => {
		drawMarkingOnRulerCanvas({
			scale,
			points,
			startMarking,
			originOffset,
			markingGaps,
			orientation,
			rulerCanvasRef,
			selectedGuide: selectedOrHoveredGuide,
		});
	}, [
		scale,
		points,
		startMarking,
		originOffset,
		markingGaps,
		orientation,
		selectedOrHoveredGuide,
	]);

	const {width: canvasContainerWidth, height: canvasContainerHeight} =
		containerRef.current?.getBoundingClientRect() || {width: 0, height: 0};
	const rulerWidth = isVerticalRuler ? RULER_WIDTH : canvasContainerWidth;
	const rulerHeight = isVerticalRuler ? canvasContainerHeight : RULER_WIDTH;

	const rulerStyle: React.CSSProperties = useMemo(
		() => ({
			position: 'absolute',
			background: BACKGROUND,
			width: `${rulerWidth}px`,
			height: `${rulerHeight}px`,
			left: isVerticalRuler ? 0 : 'unset',
			top: isVerticalRuler ? 'unset' : 0,
			borderBottom: isVerticalRuler ? undefined : '1px solid ' + RULER_COLOR,
			borderRight: isVerticalRuler ? '1px solid ' + RULER_COLOR : undefined,
			cursor,
		}),
		[rulerWidth, rulerHeight, cursor, isVerticalRuler],
	);

	const onMouseDown: React.PointerEventHandler<HTMLCanvasElement> = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
			if (e.button !== 0) {
				return;
			}

			e.preventDefault();
			shouldCreateGuideRef.current = true;
			document.body.style.cursor = 'no-drop';
			const guideId = makeGuideId();
			setEditorShowGuides(() => true);
			setSelectedGuideId(() => guideId);
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
			setSelectedGuideId,
			setGuidesList,
			orientation,
			originOffset,
			unsafeVideoConfig.id,
		],
	);

	const changeCursor = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
			e.preventDefault();
			if (selectedGuideId !== null) {
				setCursor('no-drop');
			}
		},
		[setCursor, selectedGuideId],
	);

	useEffect(() => {
		if (selectedGuideId === null) {
			setCursor(isVerticalRuler ? 'ew-resize' : 'ns-resize');
		}
	}, [selectedGuideId, isVerticalRuler]);

	return (
		<canvas
			ref={rulerCanvasRef}
			width={rulerWidth * devicePixelRatio}
			height={rulerHeight * devicePixelRatio}
			style={rulerStyle}
			onPointerDown={onMouseDown}
			onPointerEnter={changeCursor}
			onPointerLeave={changeCursor}
		/>
	);
};

export default Ruler;
