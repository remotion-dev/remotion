import {flannel} from '@remotion/effects/flannel';
import React from 'react';
import {Solid, useVideoConfig} from 'remotion';

export const EffectsFlannelPreview: React.FC<{
	readonly amount: number;
	readonly size: number;
	readonly softness: number;
	readonly baseColor: string;
	readonly stripeColor: string;
}> = ({amount, size, softness, baseColor, stripeColor}) => {
	const {width, height} = useVideoConfig();

	return (
		<Solid
			width={width}
			height={height}
			color={baseColor}
			effects={[flannel({amount, size, softness, baseColor, stripeColor})]}
		/>
	);
};
