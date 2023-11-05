import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
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
		guidesList,
		setGuidesList,
		selectedGuideIndex,
		setSelectedGuideIndex,
	} = useContext(EditorShowGuidesContext);
	const [cursor, setCursor] = useState<'ew-resize' | 'ns-resize' | 'no-drop'>(
		isVerticalRuler ? 'ew-resize' : 'ns-resize',
	);

	useEffect(() => {
		drawMarkingOnRulerCanvas({
			scale,
			points,
			startMarking,
			originOffset,
			markingGaps,
			orientation,
			rulerCanvasRef,
		});
	}, [scale, points, startMarking, originOffset, markingGaps, orientation]);

	const {width: canvasContainerWidth, height: canvasContainerHeight} =
		containerRef.current?.getBoundingClientRect() || {width: 0, height: 0};
	const rulerWidth = isVerticalRuler ? RULER_WIDTH : canvasContainerWidth;
	const rulerHeight = isVerticalRuler ? canvasContainerHeight : RULER_WIDTH;

	const rulerStyle: React.CSSProperties = useMemo(
		() => ({
			position: 'absolute',
			background: '#000000',
			width: `${rulerWidth}px`,
			height: `${rulerHeight}px`,
			left: isVerticalRuler ? 0 : 'unset',
			top: isVerticalRuler ? 'unset' : 0,
			cursor,
		}),
		[rulerWidth, rulerHeight, cursor, isVerticalRuler],
	);

	const onMouseDown = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
			e.preventDefault();
			shouldCreateGuideRef.current = true;
			document.body.style.cursor = 'no-drop';
			setSelectedGuideIndex(() => guidesList.length);
			setGuidesList((prevState) => {
				return [
					...prevState,
					{
						orientation,
						position: -originOffset,
					},
				];
			});
		},
		[
			shouldCreateGuideRef,
			setSelectedGuideIndex,
			setGuidesList,
			guidesList.length,
			orientation,
			originOffset,
		],
	);

	const changeCursor = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
			e.preventDefault();
			if (selectedGuideIndex !== -1) {
				setCursor('no-drop');
			}
		},
		[setCursor, selectedGuideIndex],
	);

	useEffect(() => {
		if (selectedGuideIndex === -1) {
			setCursor(isVerticalRuler ? 'ew-resize' : 'ns-resize');
		}
	}, [selectedGuideIndex, isVerticalRuler]);

	return (
		<canvas
			ref={rulerCanvasRef}
			width={rulerWidth * devicePixelRatio}
			height={rulerHeight * devicePixelRatio}
			style={rulerStyle}
			onMouseDown={onMouseDown}
			onMouseEnter={changeCursor}
			onMouseLeave={changeCursor}
		/>
	);
};

export default Ruler;
