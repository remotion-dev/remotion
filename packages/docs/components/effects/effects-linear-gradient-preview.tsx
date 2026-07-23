import type {LinearGradientUvCoordinate} from '@remotion/effects/linear-gradient';
import {linearGradient} from '@remotion/effects/linear-gradient';
import React from 'react';
import {Solid, useVideoConfig} from 'remotion';

export const EffectsLinearGradientPreview: React.FC<{
	readonly start: LinearGradientUvCoordinate;
	readonly end: LinearGradientUvCoordinate;
	readonly startColor: string;
	readonly endColor: string;
}> = ({start, end, startColor, endColor}) => {
	const {width, height} = useVideoConfig();

	return (
		<Solid
			width={width}
			height={height}
			effects={[
				linearGradient({
					start,
					end,
					startColor,
					endColor,
				}),
			]}
		/>
	);
};
