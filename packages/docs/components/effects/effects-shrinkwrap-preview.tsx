import {shrinkwrap} from '@remotion/effects/shrinkwrap';
import React from 'react';
import {AbsoluteFill, HtmlInCanvas, Img, useCurrentFrame} from 'remotion';
import shrinkwrapPreviewPng from '../../static/img/effects-shrinkwrap-preview.png';
import transitionBgBlue from '../../static/img/transition-bg-blue.jpg';

export const SHRINKWRAP_PREVIEW_PARAMS = {
	amount: 0.94,
	displacement: 13.5,
	highlightIntensity: 1.54,
	wrinkleDensity: 0.87,
	edgeTension: 0.58,
	phase: 0,
	seed: 12,
} as const;

export const EffectsShrinkwrapPreview: React.FC<{
	readonly amount: number;
	readonly displacement: number;
	readonly highlightIntensity: number;
	readonly wrinkleDensity: number;
	readonly edgeTension: number;
	readonly phase: number;
	readonly seed: number;
}> = ({
	amount,
	displacement,
	highlightIntensity,
	wrinkleDensity,
	edgeTension,
	phase,
	seed,
}) => {
	const frame = useCurrentFrame();
	const htmlInCanvasSupported = HtmlInCanvas.isSupported();

	if (!htmlInCanvasSupported) {
		return (
			<Img
				src={shrinkwrapPreviewPng}
				width={1280}
				height={720}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
				}}
			/>
		);
	}

	return (
		<HtmlInCanvas
			width={1280}
			height={720}
			effects={[
				shrinkwrap({
					amount,
					displacement,
					highlightIntensity,
					wrinkleDensity,
					edgeTension,
					phase: phase + frame * 0.05,
					seed,
				}),
			]}
		>
			<AbsoluteFill
				style={{
					backgroundImage: `url(${transitionBgBlue})`,
					backgroundPosition: 'center',
					backgroundRepeat: 'no-repeat',
					backgroundSize: 'cover',
				}}
			/>
		</HtmlInCanvas>
	);
};
