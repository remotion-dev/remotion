import {Video} from '@remotion/media';
import {HtmlInCanvasMotionBlur} from '@remotion/motion-blur';
import React from 'react';
import {staticFile, useVideoConfig} from 'remotion';

export const HtmlInCanvasMotionBlurVideo: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<HtmlInCanvasMotionBlur width={width} height={height}>
			<Video
				name="4K video"
				src={staticFile('opus.webm')}
				muted
				loop
				style={{width: '100%', height: '100%'}}
			/>
		</HtmlInCanvasMotionBlur>
	);
};
