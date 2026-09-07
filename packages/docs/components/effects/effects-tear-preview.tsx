import {tear} from '@remotion/effects/tear';
import React from 'react';
import {AbsoluteFill, CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

const container: React.CSSProperties = {
	backgroundColor: '#101827',
};

export const TEAR_PREVIEW_PARAMS = {
	progress: 0.7,
	gap: 180,
	jaggedness: 90,
	frequency: 6,
	seed: 3,
	center: 0.5,
	rotation: 6,
	direction: 'top-to-bottom',
} as const;

export const EffectsTearPreview: React.FC<{
	readonly progress: number;
	readonly gap: number;
	readonly jaggedness: number;
	readonly frequency: number;
	readonly seed: number;
	readonly center: number;
	readonly rotation: number;
	readonly direction: 'top-to-bottom' | 'bottom-to-top';
}> = ({
	progress,
	gap,
	jaggedness,
	frequency,
	seed,
	center,
	rotation,
	direction,
}) => {
	return (
		<AbsoluteFill style={container}>
			<CanvasImage
				src={EFFECTS_PREVIEW_IMAGE_SRC}
				width={1280}
				height={720}
				fit="cover"
				effects={[
					tear({
						progress,
						gap,
						jaggedness,
						frequency,
						seed,
						center,
						rotation,
						direction,
					}),
				]}
			/>
		</AbsoluteFill>
	);
};
