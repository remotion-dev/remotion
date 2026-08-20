import {colorKey} from '@remotion/effects/color-key';
import {outline} from '@remotion/effects/outline';
import {Video} from '@remotion/media';
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const EffectsOutlinePreview: React.FC<{
	readonly width: number;
	readonly edgeBlockSize: number;
	readonly color: string;
	readonly opacity: number;
	readonly outlineOnly: boolean;
}> = ({width, edgeBlockSize, color, opacity, outlineOnly}) => {
	return (
		<AbsoluteFill style={{backgroundColor: '#15171e'}}>
			<Video
				src="https://remotion.media/greenscreen.mp4"
				effects={[
					colorKey({similarity: 0.45}),
					outline({width, edgeBlockSize, color, opacity, outlineOnly}),
				]}
			/>
		</AbsoluteFill>
	);
};
