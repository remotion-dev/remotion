import {MacOSCursor} from '@remotion/mac-cursors';
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

const customCursor = `url("data:image/svg+xml,${encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="13" fill="#0b84ff" stroke="white" stroke-width="4"/></svg>',
)}") 16 16, auto`;

export const MacCursorsExample: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{backgroundColor: '#ddd'}}>
			<MacOSCursor
				name="Hideable cursor"
				cursor="pointer"
				style={{left: 350, top: 540, scale: 4}}
			/>
			<MacOSCursor
				cursor={interpolate(frame, [0, 45], ['pointer', 'custom'], {
					easing: Easing.step1,
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})}
				customCursor={customCursor}
				style={{left: 730, top: 540, scale: 4}}
			/>
		</AbsoluteFill>
	);
};
