import {dropShadow} from '@remotion/effects/drop-shadow';
import {scale} from '@remotion/effects/scale';
import {Arrow} from '@remotion/shapes';
import React from 'react';
import {Img, interpolate, useCurrentFrame} from 'remotion';
import {asset} from './assets';

export const ArrowLogo: React.FC = () => {
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
					translate: '810px 661.1px',
					rotate: '487.6deg',
					scale: 1.337,
				}}
				effects={[
					scale({
						scale: 0.8,
					}),
					dropShadow({
						offsetX: 0,
						offsetY: 0,
						radius: 100,
					}),
				]}
			/>
			<Img
				src={asset('claude-logo-png_seeklogo-554534 (1).png')}
				style={{
					position: 'absolute',
					translate: '989.9px 315.5px',
					width: 320,
					height: 320,
					scale: 0.998,
					rotate: interpolate(frame, [0, 239], ['0deg', '260deg'], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						posterize: 8,
					}),
				}}
				effects={[
					dropShadow({
						radius: 82,
					}),
				]}
			/>
		</>
	);
};
