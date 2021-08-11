import React from 'react';
import {Internals, useCurrentFrame} from 'remotion';
import styled from 'styled-components';
import {useIsStill} from '../helpers/is-current-selected-still';
import {renderFrame} from '../state/render-frame';

const Text = styled.div`
	color: white;
	font-size: 16px;
	font-family: Helvetica, Arial, sans-serif;
	display: flex;
	flex-direction: column;
	justify-content: center;
	font-variant-numeric: tabular-nums;
	line-height: 1;
`;

const Time = styled.div`
	display: inline-block;
`;

const Frame = styled.span`
	color: #ccc;
	font-size: 10px;
	font-weight: 500;
`;

export const TimeValue: React.FC = () => {
	const frame = useCurrentFrame();
	const config = Internals.useUnsafeVideoConfig();
	const isStill = useIsStill();

	if (!config) {
		return null;
	}

	if (isStill) {
		return null;
	}

	return (
		<Text>
			<Time>{renderFrame(frame, config.fps)}</Time>{' '}
			<Frame>
				{frame} <span>({config.fps} fps)</span>
			</Frame>
		</Text>
	);
};
