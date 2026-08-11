import React from 'react';
import {AbsoluteFill, Img, Series} from 'remotion';

const Inside: React.FC = () => {
	return (
		<Img
			pauseWhenLoading
			src="https://images.unsplash.com/photo-1707669291003-a7afa20b0a05?q=80&w=2487&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
		/>
	);
};

export const NativeBufferStateForImage: React.FC = () => {
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
