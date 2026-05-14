import React from 'react';
import {useCurrentFrame} from 'remotion';

export const HtmlInCanvasScene: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<div
			style={{
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 40,
				color: 'white',
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
				textAlign: 'center',
				fontSize: 56,
				fontWeight: 600,
				padding: '20px 40px',
				borderRadius: 24,
			}}
		>
			Hello World {frame}
		</div>
	);
};
