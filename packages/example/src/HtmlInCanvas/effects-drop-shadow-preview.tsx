import {dropShadow} from '@remotion/effects/drop-shadow';
import {scale} from '@remotion/effects/scale';
import React from 'react';
import {HtmlInCanvas, useVideoConfig} from 'remotion';
import {EffectsPreviewImage} from './effects-preview-image';

export const EffectsDropShadowPreview: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<HtmlInCanvas
			width={width}
			height={height}
			effects={[
				scale({scale: 0.82}),
				dropShadow({
					radius: 24,
					offsetX: 28,
					offsetY: 28,
					opacity: 0.65,
					color: '#000000',
				}),
			]}
		>
			<EffectsPreviewImage />
		</HtmlInCanvas>
	);
};
