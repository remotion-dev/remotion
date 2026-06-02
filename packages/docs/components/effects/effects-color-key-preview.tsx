import {colorKey} from '@remotion/effects/color-key';
import {Video} from '@remotion/media';
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const EffectsColorKeyPreview: React.FC<{
	readonly keyColor: string;
	readonly similarity: number;
	readonly smoothness: number;
	readonly spillSuppression: number;
}> = ({keyColor, similarity, smoothness, spillSuppression}) => {
	return (
		<AbsoluteFill>
			<Video
				src="https://remotion.media/greenscreen.mp4"
				effects={[
					colorKey({keyColor, similarity, smoothness, spillSuppression}),
				]}
			/>
		</AbsoluteFill>
	);
};
