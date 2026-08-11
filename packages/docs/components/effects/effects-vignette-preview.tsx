import {
	vignette,
	type VignetteCenter,
	type VignetteMode,
} from '@remotion/effects/vignette';
import React from 'react';
import {AbsoluteFill, CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

const checkerboard: React.CSSProperties = {
	backgroundColor: '#f2f2f2',
	backgroundImage:
		'linear-gradient(45deg, #d8d8d8 25%, transparent 25%), linear-gradient(-45deg, #d8d8d8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d8d8d8 75%), linear-gradient(-45deg, transparent 75%, #d8d8d8 75%)',
	backgroundSize: '40px 40px',
	backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0',
};

const fullSize: React.CSSProperties = {
	width: '100%',
	height: '100%',
};

export const EffectsVignettePreview: React.FC<{
	readonly amount: number;
	readonly radius: number;
	readonly feather: number;
	readonly roundness: number;
	readonly color: string;
	readonly mode: VignetteMode;
	readonly center: VignetteCenter;
}> = ({amount, radius, feather, roundness, color, mode, center}) => {
	return (
		<AbsoluteFill style={checkerboard}>
			<CanvasImage
				src={EFFECTS_PREVIEW_IMAGE_SRC}
				width={1280}
				height={720}
				fit="cover"
				style={fullSize}
				effects={[
					vignette({
						amount,
						radius,
						feather,
						roundness,
						color,
						mode,
						center,
					}),
				]}
			/>
		</AbsoluteFill>
	);
};
