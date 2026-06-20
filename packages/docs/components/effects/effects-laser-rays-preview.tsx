import {laserRays} from '@remotion/effects/laser-rays';
import React from 'react';
import {Solid} from 'remotion';

export const EffectsLaserRaysPreview: React.FC<{
	readonly color: string;
	readonly backgroundColor: string;
	readonly center: readonly [number, number];
	readonly rayCount: number;
	readonly sharpness: number;
	readonly intensity: number;
	readonly amount: number;
	readonly rotation: number;
	readonly radiusFalloff: number;
}> = ({
	color,
	backgroundColor,
	center,
	rayCount,
	sharpness,
	intensity,
	amount,
	rotation,
	radiusFalloff,
}) => {
	return (
		<Solid
			color={backgroundColor}
			width={1280}
			height={720}
			effects={[
				laserRays({
					color,
					backgroundColor,
					center,
					rayCount,
					sharpness,
					intensity,
					amount,
					rotation,
					radiusFalloff,
				}),
			]}
		/>
	);
};
