import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {defaultStyles} from './styles';

export const Name: React.FC<{
	readonly name: string;
}> = ({name}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();
	const progress = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
	});
	return (
		<AbsoluteFill
			style={{
				...defaultStyles,
				backgroundColor: 'white',
				color: 'black',
			}}
		>
			<div
				style={{
					transform: `translateY(${interpolate(
						progress,
						[0, 1],
						[1000, 0],
					)}px)`,
				}}
			>
				<span
					style={{
						display: 'block',
						lineHeight: 1.1,
					}}
				>
					Hi {name || 'there'}!
				</span>
				<span
					style={{
						display: 'block',
						lineHeight: 1.1,
					}}
				>
					Your favorite color is
				</span>
			</div>
		</AbsoluteFill>
	);
};
