import React, {useEffect, useMemo, useRef} from 'react';
import {drawMarkingOnRulerCanvas} from '../../helpers/editor-ruler';
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
		}),
		[orientation, rulerWidth, rulerHeight],
	);

	return (
		<canvas
			ref={rulerCanvasRef}
			width={rulerWidth * devicePixelRatio}
			height={rulerHeight * devicePixelRatio}
			style={rulerStyle}
		/>
	);
};

export default Ruler;
