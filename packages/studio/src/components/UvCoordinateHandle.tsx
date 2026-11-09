import React from 'react';
import {BLUE, SELECTED_OUTLINE_UV_DROP_SHADOW, WHITE} from '../helpers/colors';

const style: React.CSSProperties = {
	filter: SELECTED_OUTLINE_UV_DROP_SHADOW,
};

export const UvCoordinateHandle: React.FC<{
	readonly x: number;
	readonly y: number;
	readonly selected: boolean;
	readonly onPointerDown: React.PointerEventHandler<SVGCircleElement> | null;
}> = ({x, y, selected, onPointerDown}) => {
	return (
		<circle
			cx={x}
			cy={y}
			r={selected ? 6.8 : 4.25}
			fill={WHITE}
			stroke={BLUE}
			strokeWidth={2}
			style={style}
			vectorEffect="non-scaling-stroke"
			pointerEvents={onPointerDown === null ? 'none' : 'all'}
			cursor="default"
			onPointerDown={onPointerDown ?? undefined}
		/>
	);
};
