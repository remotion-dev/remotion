import React from 'react';
import {AbsoluteFill} from 'remotion';

export const filterInputCases = [
	{kind: 'scaled', left: -100, transform: 'translateX(-150px) scaleX(2)'},
	{kind: 'reflected', left: 400, transform: 'translateX(150px) scaleX(-2)'},
	{
		kind: 'skewed',
		left: -100,
		transform: 'translateX(-150px) scaleX(2) skewY(10deg)',
	},
	{
		kind: 'projective',
		left: -100,
		transform: 'translateX(-150px) scaleX(2) rotateY(20deg)',
	},

	{
		kind: 'projective-front',
		left: -100,
		transform: 'translateX(-150px) scaleX(2) rotateY(-20deg)',
	},
	{kind: 'rounded', left: -100, transform: 'translateX(-150px) scaleX(2)'},
	{kind: 'gradient', left: -100, transform: 'translateX(-150px) scaleX(2)'},
	{kind: 'blurred', left: -100, transform: 'translateX(-150px) scaleX(2)'},
	{kind: 'text', left: -100, transform: 'translateX(-150px) scaleX(2)'},
	{
		kind: 'fractional',
		left: -100.25,
		transform: 'translateX(-130px) scale(1.5, 0.75)',
	},

	{kind: 'gradient-visible', left: 25, transform: 'scaleX(2)'},
	{kind: 'text-visible', left: 25, transform: 'scaleX(2)'},
	{kind: 'rounded-visible', left: 25, transform: 'scaleX(2)'},
	{kind: 'texture-visible', left: 25, transform: 'scaleX(2)'},
] as const;

export const projectiveFilterInput = (
	kind: (typeof filterInputCases)[number]['kind'],
	preserving: boolean,
	position: {left: number; top: number; shadowOffset: number} | null = null,
) => {
	const scene = filterInputCases.find((item) => item.kind === kind)!;
	const Component: React.FC = () => (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
				perspective: kind.startsWith('projective') ? 400 : undefined,
				transformStyle: preserving ? 'preserve-3d' : 'flat',
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: position?.left ?? scene.left,
					top: position?.top ?? (kind === 'fractional' ? 100.25 : 100),
					width: kind === 'fractional' ? 50.5 : 50,
					height: kind === 'fractional' ? 49.25 : 50,
					backgroundColor: kind.startsWith('text') ? 'transparent' : 'red',
					backgroundImage: kind.startsWith('gradient')
						? 'linear-gradient(90deg, red, lime)'
						: kind === 'texture-visible'
							? 'repeating-linear-gradient(45deg, red 0px, red 3px, white 3px, white 6px)'
							: undefined,
					borderRadius: kind.startsWith('rounded') ? 20 : 0,
					fontSize: 24,
					color: 'red',
					transform: scene.transform,
					transformOrigin: '0 0',
					filter:
						kind === 'blurred'
							? 'blur(2px) drop-shadow(150px 0 0 blue)'
							: kind.endsWith('visible')
								? `drop-shadow(${position?.shadowOffset ?? 60}px 0 0 blue)`
								: 'drop-shadow(150px 0 0 blue)',
				}}
			>
				{kind.startsWith('text') ? 'Aa' : null}
			</div>
		</AbsoluteFill>
	);
	return {
		component: Component,
		id: `filter-input-${kind}-${preserving ? 'preserving' : 'flat'}${position ? `-${position.left}-${position.top}-${position.shadowOffset}` : ''}`,
		width: 300,
		height: 300,
		fps: 30,
		durationInFrames: 1,
	} as const;
};
