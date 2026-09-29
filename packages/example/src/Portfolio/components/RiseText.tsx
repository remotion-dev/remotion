import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';

const enterEase = Easing.bezier(0.16, 1, 0.3, 1);
const exitEase = Easing.bezier(0.7, 0, 0.84, 0);

type Props = {
	readonly text: string;
	readonly start: number;
	readonly stagger?: number;
	readonly duration?: number;
	readonly exitAt?: number;
	readonly exitStagger?: number;
	readonly style?: React.CSSProperties;
};

// Letters rise out of a mask one by one, and optionally sink back into it.
export const RiseText: React.FC<Props> = ({
	text,
	start,
	stagger = 3,
	duration = 22,
	exitAt,
	exitStagger = 2,
	style,
}) => {
	const frame = useCurrentFrame();

	return (
		<span style={{display: 'inline-flex', overflow: 'hidden', ...style}}>
			{Array.from(text).map((char, i) => {
				const enterStart = start + i * stagger;
				const enter = interpolate(
					frame,
					[enterStart, enterStart + duration],
					[130, 0],
					{
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: enterEase,
					},
				);
				const exit =
					exitAt === undefined
						? 0
						: interpolate(
								frame,
								[exitAt + i * exitStagger, exitAt + i * exitStagger + 16],
								[0, 130],
								{
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
									easing: exitEase,
								},
							);

				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							whiteSpace: 'pre',
							translate: `0 ${enter + exit}%`,
						}}
					>
						{char}
					</span>
				);
			})}
		</span>
	);
};
