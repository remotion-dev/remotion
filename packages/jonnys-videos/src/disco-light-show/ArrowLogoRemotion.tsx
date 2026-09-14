import {dropShadow} from '@remotion/effects/drop-shadow';
import {scale} from '@remotion/effects/scale';
import {noise2D} from '@remotion/noise';
import {Arrow} from '@remotion/shapes';
import React from 'react';
import {Img, useCurrentFrame} from 'remotion';
import {asset} from './assets';

export const ArrowLogoRemotion: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<Arrow
				length={300}
				headWidth={185}
				headLength={120}
				shaftWidth={80}
				direction="right"
				cornerRadius={0}
				fill={'#ffffff'}
				style={{
					position: 'absolute',
					translate: '903.4px 247.4px',
					rotate: '605.3deg',
					scale: 1.337,
				}}
				effects={[
					scale({
						scale: 0.7,
					}),
					dropShadow({
						offsetX: 0,
						offsetY: 0,
						radius: 100,
					}),
				]}
			/>
			<Img
				src={asset('remotion-logo.svg')}
				style={{
					position: 'absolute',
					translate: `${1125 + noise2D('remotion-logo-x', frame * 0.04, 0) * 20}px ${456.5 + noise2D('remotion-logo-y', frame * 0.04, 0) * 20}px`,
					width: 320,
					height: 320,
					scale: 0.998,
					rotate: `${noise2D('remotion-logo-rotation', frame * 0.04, 0) * 9}deg`,
				}}
				effects={[
					scale({
						scale: 0.7,
					}),
					dropShadow({
						radius: 82,
					}),
				]}
			/>
		</>
	);
};
