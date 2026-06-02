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
		<AbsoluteFill
			style={{
				background:
					'linear-gradient(135deg, #1f2937 0%, #4338ca 50%, #be185d 100%)',
			}}
		>
			<AbsoluteFill>
				<Video
					src="https://remotion.media/greenscreen.mp4"
					effects={[
						colorKey({keyColor, similarity, smoothness, spillSuppression}),
					]}
				/>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
