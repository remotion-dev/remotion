import React, {useEffect} from 'react';
import {AbsoluteFill, Series, useBufferState} from 'remotion';

const Inside: React.FC = () => {
	const buffer = useBufferState();

	useEffect(() => {
		const block = buffer.delayPlayback();
		setTimeout(() => {
			block.unblock();
		}, 5000);

		return () => {
			block.unblock();
		};
	}, [buffer]);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'blue',
			}}
		/>
	);
};

export const NativeBufferState: React.FC = () => {
	return (
		<Series>
			<Series.Sequence durationInFrames={100}>
				<AbsoluteFill style={{backgroundColor: 'red'}} />
			</Series.Sequence>
			<Series.Sequence durationInFrames={100}>
				<Inside />
			</Series.Sequence>
		</Series>
	);
};
