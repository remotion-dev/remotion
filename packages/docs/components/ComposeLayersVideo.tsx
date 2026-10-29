import {useColorMode} from '@docusaurus/theme-common';
import React from 'react';

export const ComposeLayersVideo: React.FC = () => {
	const {colorMode} = useColorMode();

	return (
		<video
			src={
				colorMode === 'dark'
					? 'https://remotion.media/why/compose-layers-dark-7695892c8fe8.mp4'
					: 'https://remotion.media/why/compose-layers-5e32d80d3576.mp4'
			}
			width={1440}
			height={600}
			autoPlay
			loop
			muted
			playsInline
			preload="metadata"
			aria-label="Video and HTML layers separating and recombining across connected scenes"
			style={{
				display: 'block',
				width: '100%',
				height: 'auto',
				aspectRatio: '12 / 5',
				backgroundColor: 'var(--ifm-background-color)',
				borderRadius: 'var(--ifm-global-radius)',
			}}
		/>
	);
};
