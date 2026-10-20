import {dropShadow} from '@remotion/effects/drop-shadow';
import {scale} from '@remotion/effects/scale';
import {noise2D} from '@remotion/noise';
import React from 'react';
import {Interactive, CanvasImage, useCurrentFrame} from 'remotion';
import {cutoutPaperEffects} from '../paper-disco/cutout-paper';
import {asset} from './assets';
import {NOTEBOOK_ARROW_SRC} from './notebook-arrow';

const ArrowLogoRemotionInner: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<CanvasImage
				name="Pointer arrow"
				src={NOTEBOOK_ARROW_SRC}
				width={300}
				height={185}
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
					...cutoutPaperEffects({
						gridOpacity: null,
						edgeRoughness: 0.12,
						unit: 1 / (1.337 * 0.736 * 1.24),
						seed: 11,
					}),
				]}
			/>
			<CanvasImage
				name="Remotion logo"
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

export const ArrowLogoRemotion = Interactive.create({
	Component: ArrowLogoRemotionInner,
	layout: 'absolute-fill',
});
