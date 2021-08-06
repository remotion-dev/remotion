import React from 'react';
import {useCurrentFrame} from 'remotion';

// Try to render using:
// npx remotion render src/index.tsx skip-zero-frame --frames=10-20 skip.mp4

export const SkipZeroFrame: React.FC = () => {
	const frame = useCurrentFrame();

	if (frame === 0 && process.env.NODE_ENV === 'production') {
		throw new Error('should not render frame 0');
	}

	return <div>{frame}</div>;
};
