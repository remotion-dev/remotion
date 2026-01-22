import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';

export const Tagline: React.FC = () => {
	const frame = useCurrentFrame();
	const text = 'Next-level video creation';

	// Start typing at frame 200 (3.33s), 2 frames per character
	const startFrame = 200;
	const framesPerChar = 2;
	const charsToShow = Math.floor((frame - startFrame) / framesPerChar);
	const displayText = text.slice(0, Math.max(0, charsToShow));

	// Cursor blinks every 15 frames
	const cursorOpacity = Math.floor(frame / 15) % 2;
	const showCursor = frame >= startFrame && frame < startFrame + text.length * framesPerChar + 30;

	return (
		<div
			style={{
				fontFamily: 'Inter, monospace',
				fontSize: '28px',
				fontWeight: '400',
				color: '#a78bfa',
				letterSpacing: '0.02em',
				textAlign: 'center',
				marginTop: '20px',
			}}
		>
			{displayText}
			{showCursor && (
				<span
					style={{
						opacity: cursorOpacity,
						marginLeft: '2px',
					}}
				>
					|
				</span>
			)}
		</div>
	);
};
