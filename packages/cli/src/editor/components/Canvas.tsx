import React, {useRef} from 'react';
import {useElementSize} from '../hooks/get-el-size';
import {VideoPreview} from './Preview';

const styles: React.CSSProperties = {
	flex: 1,
	display: 'flex',
	overflow: 'hidden',
	position: 'relative',
};

export const Canvas: React.FC = () => {
	const ref = useRef<HTMLDivElement>(null);

	const size = useElementSize(ref);

	return (
		<div ref={ref} style={styles}>
			{size ? <VideoPreview canvasSize={size} /> : null}
		</div>
	);
};
