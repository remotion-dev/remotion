import {PlayerInternals} from '@remotion/player';
import React, {useRef} from 'react';
import {VideoPreview} from './Preview';

const container: React.CSSProperties = {
	flex: 1,
	display: 'flex',
	overflow: 'hidden',
	position: 'relative',
};

export const Canvas: React.FC = () => {
	const ref = useRef<HTMLDivElement>(null);

	const size = PlayerInternals.useElementSize(ref, {
		triggerOnWindowResize: false,
	});

	return (
		<div ref={ref} style={container}>
			{size ? <VideoPreview canvasSize={size} /> : null}
		</div>
	);
};
