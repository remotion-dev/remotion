import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';

const Inner: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<Sequence width={width / 2} height={height / 2}>
			<AbsoluteFill
				style={{
					backgroundColor: 'blue',
				}}
			/>
		</Sequence>
	);
};

export const WidthHeightSequences: React.FC = () => {
	const {height, width} = useVideoConfig();

	return (
		<Sequence width={width / 2} height={height / 2}>
			<AbsoluteFill
				style={{
					backgroundColor: 'red',
				}}
			>
				<Inner />
			</AbsoluteFill>
		</Sequence>
	);
};
