import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {getReadableColor} from './readable-color';
import {defaultStyles} from './styles';

export const Big: React.FC<{
	readonly color: string;
}> = ({color}) => {
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
				color: getReadableColor(color),
				fontSize: 150,
			}}
		>
			<span
				style={{
					display: 'block',
					transform: `translateY(${interpolate(
						progress,
						[0, 1],
						[1000, 0],
					)}px)`,
				}}
			>
				{color}
			</span>
		</AbsoluteFill>
	);
};
