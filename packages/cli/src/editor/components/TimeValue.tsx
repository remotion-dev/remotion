import React from 'react';
import {Internals, useCurrentFrame} from 'remotion';
import styled from 'styled-components';
import {renderFrame} from '../state/render-frame';

const Text = styled.div`
	color: white;
	font-size: 24px;
	font-family: Arial, Helvetica, sans-serif;
`;

export const TimeValue: React.FC = () => {
	const frame = useCurrentFrame();
	const config = Internals.useUnsafeVideoConfig();

	if (!config) {
		return null;
	}

	return (
		<Text>
			{renderFrame(frame, config.fps)} ({frame})
		</Text>
	);
};
