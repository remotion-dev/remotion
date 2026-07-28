import React from 'react';
import {Sequence} from 'remotion';
import {Skills2Announcement} from './Skills2Announcement/index';

export const Skills2Gesture: React.FC = () => {
	return (
		<Sequence
			name="Skills2Announcement"
			width={1920}
			height={1080}
			durationInFrames={180}
			style={{
				position: 'absolute',
				translate: '0px 0px',
			}}
		>
			<Skills2Announcement />
		</Sequence>
	);
};
