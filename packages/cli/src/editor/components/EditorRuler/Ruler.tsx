import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
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
	const {
		shouldCreateGuideRef,
		guidesList,
		setGuidesList,
		selectedGuideIndex,
		setSelectedGuideIndex,
	} = useContext(EditorShowGuidesContext);
	const [cursor, setCursor] = useState<'ew-resize' | 'ns-resize' | 'no-drop'>(
		orientation === 'vertical' ? 'ew-resize' : 'ns-resize',
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

	const canvasContainerWidth =
		containerRef.current?.getBoundingClientRect()?.width || 0;
	const canvasContainerHeight =
		containerRef.current?.getBoundingClientRect()?.height || 0;
	const rulerWidth =
		orientation === 'horizontal' ? canvasContainerWidth : RULER_WIDTH;
	const rulerHeight =
		orientation === 'horizontal' ? RULER_WIDTH : canvasContainerHeight;

	const rulerStyle: React.CSSProperties = useMemo(
		() => ({
			position: 'absolute',
			background: '#000000',
			width: `${rulerWidth}px`,
			height: `${rulerHeight}px`,
			...(orientation === 'vertical'
				? {
						left: 0,
				  }
				: {
						top: 0,
				  }),
			cursor,
		}),
		[orientation, rulerWidth, rulerHeight, cursor],
	);

	useEffect(() => {
		if (selectedGuideIndex === -1) {
			setCursor(orientation === 'vertical' ? 'ew-resize' : 'ns-resize');
		}
	}, [selectedGuideIndex, orientation]);

	return (
		<canvas
			ref={rulerCanvasRef}
			width={rulerWidth * devicePixelRatio}
			height={rulerHeight * devicePixelRatio}
			style={rulerStyle}
			onMouseDown={(e) => {
				e.preventDefault();
				shouldCreateGuideRef.current = true;
				document.body.style.cursor = 'no-drop';
				setSelectedGuideIndex(() => guidesList.length);
				setGuidesList((prevState) => {
					return [
						...prevState,
						{
							orientation,
							position: -originOffset / scale,
						},
					];
				});
			}}
			onMouseEnter={(e) => {
				e.preventDefault();
				if (selectedGuideIndex !== -1) {
					setCursor('no-drop');
				}
			}}
			onMouseLeave={(e) => {
				e.preventDefault();
				if (selectedGuideIndex !== -1) {
					setCursor('no-drop');
				}
			}}
		/>
	);
};

export default Ruler;
