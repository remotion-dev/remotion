import {dropShadow} from '@remotion/effects/drop-shadow';
import {scale} from '@remotion/effects/scale';
import React from 'react';
import {Interactive, CanvasImage, interpolate, useCurrentFrame} from 'remotion';
import {cutoutPaperEffects} from '../paper-disco/cutout-paper';
import {asset} from './assets';
import {NOTEBOOK_ARROW_SRC} from './notebook-arrow';

const ArrowLogoInner: React.FC = () => {
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
					translate: '810px 661.1px',
					rotate: '487.6deg',
					scale: 1.337,
				}}
				effects={[
					scale({
						scale: 0.8,
					}),
					...cutoutPaperEffects({
						gridOpacity: null,
						edgeRoughness: 0.12,
						unit: 1 / (1.337 * 0.606 * 1.24),
						seed: 10,
					}),
				]}
			/>
			<CanvasImage
				name="Claude logo"
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

export const ArrowLogo = Interactive.create({
	Component: ArrowLogoInner,
	layout: 'absolute-fill',
});
