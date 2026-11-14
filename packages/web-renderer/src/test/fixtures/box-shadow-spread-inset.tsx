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

// KINO-7770: inset buffers must be independent of spread and background clipping.
const ReviewComponent = ({
	contentClip = false,
}: {
	readonly contentClip?: boolean;
}) => {
	const frame = useCurrentFrame();
	const shadows = contentClip
		? [
				{id: 'rounded-content', value: 'inset 0 0 0 10px blue', radius: 4},
				{id: 'rectangular-content', value: 'inset 0 0 0 10px blue', radius: 0},
			]
		: [
				{id: 'positive-spread', value: 'inset 0 0 0 20000px blue', radius: 0},
				{id: 'positive-offset', value: 'inset 20000px 0 0 0 blue', radius: 0},
				{id: 'negative-spread', value: 'inset 0 0 0 -20000px blue', radius: 0},
				{
					id: 'offset-negative-spread',
					value: 'inset 20000px 20000px 0 -20000px blue',
					radius: 0,
				},
			];
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			{shadows.map((shadow, index) => (
				<div
					key={shadow.id}
					style={{
						position: 'absolute',
						left: 20 + index * 140 + frame * 4,
						top: 20,
						width: 100,
						height: 80,
						boxSizing: 'border-box',
						padding: contentClip ? 20 : 0,
						borderRadius: shadow.radius,
						backgroundColor: 'red',
						backgroundClip: contentClip ? 'content-box' : 'border-box',
						boxShadow: shadow.value,
					}}
				/>
			))}
		</AbsoluteFill>
	);
};

export const boxShadowInsetReview = {
	...boxShadowSpreadInset,
	component: () => <ReviewComponent />,
	id: 'box-shadow-inset-review',
	width: 600,
	height: 140,
};
export const boxShadowInsetContentClip = {
	...boxShadowInsetReview,
	component: () => <ReviewComponent contentClip />,
	id: 'box-shadow-inset-content-clip',
	width: 300,
};
const RoundingControl = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<div
				style={{
					position: 'absolute',
					left: 20 + frame * 4,
					top: 20,
					width: 100,
					height: 80,
					borderRadius: 4,
					backgroundColor: 'blue',
				}}
			/>
		</AbsoluteFill>
	);
};

export const boxShadowInsetRoundingControl = {
	...boxShadowInsetContentClip,
	component: RoundingControl,
	id: 'box-shadow-inset-rounding-control',
};
