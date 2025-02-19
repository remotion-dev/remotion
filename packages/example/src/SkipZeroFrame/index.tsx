import React from 'react';
import {getRemotionEnvironment, useCurrentFrame} from 'remotion';

// Try to render using:
// npx remotion render src/index.ts skip-zero-frame --frames=10-20 skip.mp4

export const SkipZeroFrame: React.FC = () => {
	const frame = useCurrentFrame();

	if (frame === 0 && getRemotionEnvironment().isRendering) {
		throw new Error('should not render frame 0');
	}

	return <div>{frame}</div>;
};
