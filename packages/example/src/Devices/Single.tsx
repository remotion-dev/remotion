import {useVideoConfig} from '@remotion/core';
import React from 'react';

export const Single: React.FC<{
	style: React.CSSProperties;
	source: any;
}> = ({style, source}) => {
	const videoConfig = useVideoConfig();
	return (
		<img
			style={{
				position: 'absolute',
				transform: 'scale(0.5)',
				WebkitFilter: 'drop-shadow(0px 5px 5px rgba(0, 0, 0,0.3))',
				...(style || {}),
				top: (videoConfig.height - videoConfig.width) / 2,
			}}
			src={source}
		/>
	);
};
