import {liquidContours} from '@remotion/effects/liquid-contours';
import React from 'react';
import {Solid, useVideoConfig} from 'remotion';

export const EffectsLiquidContoursPreview: React.FC<{
	readonly firstColor: string;
	readonly secondColor: string;
	readonly spacing: number;
	readonly scale: number;
	readonly complexity: number;
	readonly smoothness: number;
	readonly seed: number;
	readonly offsetX: number;
	readonly offsetY: number;
	readonly phase: number;
}> = (props) => {
	const {width, height} = useVideoConfig();

	return (
		<Solid
			color="transparent"
			width={width}
			height={height}
			effects={[liquidContours(props)]}
		/>
	);
};
