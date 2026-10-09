import {Video} from '@remotion/media';
import React from 'react';
import {Interactive, useVideoConfig} from 'remotion';
import {asset} from './assets';

const SeparateInner: React.FC = () => {
	const {fps} = useVideoConfig();
	return (
		<>
			<Video
				premountFor={fps}
				src={asset('Screen Recording 2026-07-19 at 17.05.25.mov')}
				style={{
					position: 'absolute',
					translate: '-926.2px -220.9px',
					width: 2702,
					height: 1546,
					scale: 0.485,
					borderRadius: 60,
				}}
				playbackRate={0.8}
			/>
		</>
	);
};

export const Separate = Interactive.withSchema({
	Component: SeparateInner,
	componentName: 'Separate',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});
