import type React from 'react';
import {AbsoluteFill} from 'remotion';

export const CloseUpFrame = ({
	children,
}: {
	readonly children: React.ReactNode;
}) => {
	return (
		<AbsoluteFill
			showInTimeline={false}
			style={{backgroundColor: '#1f2427', overflow: 'hidden'}}
		>
			{children}
		</AbsoluteFill>
	);
};
