import {colorKey} from '@remotion/effects/color-key';
import {Video} from '@remotion/media';
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const Greenscreen: React.FC = () => {
	return (
		<AbsoluteFill>
			<AbsoluteFill>
				<Video
					src="https://remotion.media/greenscreen.mp4"
					effects={[
						colorKey({
							similarity: 0.37,
						}),
					]}
				/>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
