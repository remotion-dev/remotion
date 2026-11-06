import type {CSSProperties} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

const cases: CSSProperties[] = [
	{boxShadow: '4px 6px 0 8px blue'},
	{boxShadow: '8px 6px 0 -4px blue'},
	{boxShadow: 'inset 4px 6px 0 8px blue'},
	{boxShadow: 'inset 4px 6px 0 8px blue', border: '4px solid green'},
	{
		boxShadow:
			'inset 4px 6px 0 8px rgba(0,0,255,.5), -4px -6px 0 8px red, 4px 6px 0 8px blue',
	},
	{boxShadow: 'inset 8px 6px 0 -4px blue'},
];

const Component: React.FC<{backgroundColor: string; tileColor: string}> = ({
	backgroundColor,
	tileColor,
}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor}}>
			{cases.map((style, i) => (
				<div
					key={`${style.boxShadow}-${style.border}`}
					style={{
						position: 'absolute',
						left: 40 + (i % 3) * 200 + frame * 4,
						top: 40 + Math.floor(i / 3) * 180,
						width: 100,
						height: 80,
						boxSizing: 'border-box',
						backgroundColor: tileColor,
						...style,
					}}
				/>
			))}
		</AbsoluteFill>
	);
};

export const boxShadowSpreadInset = {
	component: () => (
		<Component backgroundColor="white" tileColor="rgb(240,240,240)" />
	),
	id: 'box-shadow-spread-inset',
	width: 600,
	height: 360,
	fps: 30,
	durationInFrames: 2,
} as const;

export const boxShadowSpreadInsetAlpha = {
	...boxShadowSpreadInset,
	component: () => (
		<Component backgroundColor="transparent" tileColor="rgba(240,240,240,.5)" />
	),
	id: 'box-shadow-spread-inset-alpha',
} as const;
