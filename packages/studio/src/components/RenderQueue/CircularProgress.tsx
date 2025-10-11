import React from 'react';
import {LIGHT_TEXT} from '../../helpers/colors';

export const RENDER_STATUS_INDICATOR_SIZE = 16;

const STROKE_WIDTH = 3;

const container: React.CSSProperties = {
	height: RENDER_STATUS_INDICATOR_SIZE,
	width: RENDER_STATUS_INDICATOR_SIZE,
	transform: `rotate(-90deg)`,
};

export const CircularProgress: React.FC<{
	readonly progress: number;
}> = ({progress}) => {
	const r = RENDER_STATUS_INDICATOR_SIZE / 2 - STROKE_WIDTH;
	const circumference = r * Math.PI * 2;

	return (
		<svg
			style={container}
			viewBox={`0 0 ${RENDER_STATUS_INDICATOR_SIZE} ${RENDER_STATUS_INDICATOR_SIZE}`}
		>
			<circle
				r={RENDER_STATUS_INDICATOR_SIZE / 2 - STROKE_WIDTH}
				stroke={LIGHT_TEXT}
				fill="none"
				strokeWidth={STROKE_WIDTH}
				cx={RENDER_STATUS_INDICATOR_SIZE / 2}
				cy={RENDER_STATUS_INDICATOR_SIZE / 2}
				strokeDasharray={`${circumference} ${circumference}`}
				strokeMiterlimit={0}
				strokeDashoffset={(1 - progress) * circumference}
			/>
		</svg>
	);
};
