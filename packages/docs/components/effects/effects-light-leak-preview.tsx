import {lightLeak} from '@remotion/effects/light-leak';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

const fullSize: React.CSSProperties = {
	width: '100%',
	height: '100%',
};

export const EffectsLightLeakPreview: React.FC<{
	readonly seed: number;
	readonly hueShift: number;
	readonly progress: number;
}> = ({seed, hueShift, progress}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			style={fullSize}
			effects={[
				lightLeak({
					seed,
					hueShift,
					progress,
				}),
			]}
		/>
	);
};
