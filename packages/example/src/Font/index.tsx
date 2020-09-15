import {registerVideo} from '@remotion/core';
import React from 'react';
import {TextComp} from './Text';

export const Comp: React.FC = () => {
	return (
		<div
			style={{
				flex: 1,
				display: 'flex',
				backgroundColor: 'blue',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<TextComp></TextComp>
		</div>
	);
};

registerVideo(Comp, {
	fps: 30,
	height: 1080,
	width: 1080,
	durationInFrames: 30 * 30,
});
