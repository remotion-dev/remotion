import {PlayerInternals} from '@remotion/player';
import React, {useRef} from 'react';
import {BACKGROUND} from '../helpers/colors';
import {useIsStill} from '../helpers/is-current-selected-still';
import {StillPreview, VideoPreview} from './Preview';

const container: React.CSSProperties = {
	flex: 1,
	display: 'flex',
	overflow: 'hidden',
	position: 'relative',
	backgroundColor: BACKGROUND,
};

const stillContainer: React.CSSProperties = {
	flex: 1,
	display: 'flex',
	overflow: 'auto',
	position: 'relative',
	backgroundColor: BACKGROUND,
};

export const Canvas: React.FC = () => {
	const isStill = useIsStill();
	const ref = useRef<HTMLDivElement>(null);

	const size = PlayerInternals.useElementSize(ref, {
		triggerOnWindowResize: false,
		shouldApplyCssTransforms: true,
	});

	if (isStill) {
		return (
			<div ref={ref} style={stillContainer}>
				{size ? <StillPreview canvasSize={size} /> : null}
			</div>
		);
	}

	return (
		<div ref={ref} style={container}>
			{size ? <VideoPreview canvasSize={size} /> : null}
		</div>
	);
};
