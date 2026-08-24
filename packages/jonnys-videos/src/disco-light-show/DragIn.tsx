import {Video} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Interactive} from 'remotion';
import {asset} from './assets';

export const DragIn: React.FC = () => {
	return (
		<>
			<Video
				src={asset('text-behind-video-background.webm')}
				style={{
					position: 'absolute',
					width: 1920,
					height: 1080,
				}}
			/>
			<AbsoluteFill>
				<Interactive.Div>FOLLOW ME</Interactive.Div>
			</AbsoluteFill>
			<Video
				src={asset('text-behind-video-foreground.webm')}
				style={{
					position: 'absolute',
					width: 1920,
					height: 1080,
				}}
			/>
		</>
	);
};
