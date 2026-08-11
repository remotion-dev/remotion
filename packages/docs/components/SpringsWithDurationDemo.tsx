import {useColorMode} from '@docusaurus/theme-common';
import React from 'react';

export const SpringsWithDurationDemo: React.FC = () => {
	const {colorMode} = useColorMode();
	return (
		<video
			src={
				colorMode === 'dark'
					? '/img/springs-dark.mp4'
					: '/img/springs-light.mp4'
			}
			loop
			muted
			autoPlay
			playsInline
		/>
	);
};
