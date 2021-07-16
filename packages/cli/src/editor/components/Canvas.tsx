import {PlayerInternals} from '@remotion/player';
import React, {useRef} from 'react';
import styled from 'styled-components';
import {VideoPreview} from './Preview';

export const Container = styled.div`
	flex: 1;
	display: flex;
	overflow: hidden;
	position: relative;
`;

export const Canvas: React.FC = () => {
	const ref = useRef<HTMLDivElement>(null);

	const size = PlayerInternals.useElementSize(ref, false);

	return (
		<Container ref={ref}>
			{size ? <VideoPreview canvasSize={size} /> : null}
		</Container>
	);
};
