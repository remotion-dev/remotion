import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';

type Props = {
	readonly text: string;
	readonly start: number;
	readonly charsPerFrame?: number;
	readonly cursorColor?: string;
};

export const Typewriter: React.FC<Props> = ({
	text,
	start,
	charsPerFrame = 1,
	cursorColor = 'currentColor',
}) => {
	const frame = useCurrentFrame();
	const typed = Math.floor(
		interpolate(
			frame,
			[start, start + text.length / charsPerFrame],
			[0, text.length],
			{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
		),
	);
	const isTyping = typed > 0 && typed < text.length;
	const cursorVisible = isTyping || Math.floor(frame / 8) % 2 === 0;

	return (
		<span style={{whiteSpace: 'pre'}}>
			{text.slice(0, typed)}
			<span
				style={{
					display: 'inline-block',
					width: '0.6em',
					height: '1em',
					marginLeft: '0.1em',
					verticalAlign: '-0.12em',
					backgroundColor: cursorColor,
					opacity: frame >= start && cursorVisible ? 1 : 0,
				}}
			/>
		</span>
	);
};
