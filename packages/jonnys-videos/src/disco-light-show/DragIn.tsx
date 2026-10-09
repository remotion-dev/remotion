import {Video} from '@remotion/media';
import React from 'react';
import {Interactive} from 'remotion';
import {asset} from './assets';

const DragInInner: React.FC = () => {
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
			<Interactive.Div
				style={{position: 'absolute', top: 0, left: 0, right: 0}}
			>
				FOLLOW ME
			</Interactive.Div>
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

export const DragIn = Interactive.withSchema({
	Component: DragInInner,
	componentName: 'DragIn',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});
