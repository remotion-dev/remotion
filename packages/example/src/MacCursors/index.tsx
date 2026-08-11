import {MacOSCursor} from '@remotion/mac-cursors';
import React from 'react';
import {AbsoluteFill} from 'remotion';

const customCursor = `url("data:image/svg+xml,${encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="13" fill="#0b84ff" stroke="white" stroke-width="4"/></svg>',
)}") 16 16, auto`;

export const MacCursorsExample: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#ddd'}}>
			<MacOSCursor cursor="pointer" style={{left: 350, top: 540, scale: 4}} />
			<MacOSCursor
				cursor={customCursor}
				style={{left: 730, top: 540, scale: 4}}
			/>
		</AbsoluteFill>
	);
};
