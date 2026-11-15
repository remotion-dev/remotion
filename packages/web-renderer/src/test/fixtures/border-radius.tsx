import {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

const Component: React.FC = () => {
	const ref = useRef<HTMLCanvasElement>(null);

	useLayoutEffect(() => {
		if (!ref.current) return;
		const ctx = ref.current.getContext('2d');
		if (!ctx) return;
		ctx.fillStyle = 'red';
		ctx.fillRect(0, 0, 100, 100);
	}, []);

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<canvas
				ref={ref}
				style={{
					width: '50%',
					height: '50%',
					borderRadius: '10px / 20px',
				}}
				width={100}
				height={100}
			/>
		</AbsoluteFill>
	);
};

export const borderRadius = {
	component: Component,
	id: 'border-radius',
	width: 200,
	height: 200,
	fps: 25,
	durationInFrames: 1,
} as const;

export const nativeRoundedClipCases = [
	{radius: '0px', color: 'blue', nativeInset: 0, nativeRadii: [0, 0, 0, 0]},
	{radius: '4px', color: 'blue', nativeInset: 0, nativeRadii: [4, 4, 4, 4]},
	{
		radius: '999px',
		color: 'blue',
		nativeInset: 0,
		nativeRadii: [40, 40, 40, 40],
	},
	{
		radius: '24px / 12px',
		color: 'blue',
		nativeInset: 0,
		nativeRadii: [
			[24, 12],
			[24, 12],
			[24, 12],
			[24, 12],
		],
	},
	{
		radius: '4px 12px 20px 8px / 8px 20px 12px 4px',
		color: 'blue',
		nativeInset: 0,
		nativeRadii: [
			[4, 8],
			[12, 20],
			[20, 12],
			[8, 4],
		],
	},
	{
		radius: '4px',
		color: 'rgba(0,0,255,0.5)',
		nativeInset: 0,
		nativeRadii: [4, 4, 4, 4],
	},
	{radius: '4px', color: 'blue', nativeInset: 10.25, nativeRadii: [0, 0, 0, 0]},
] as const;

const NativeRoundedClipComponent = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			{nativeRoundedClipCases.map((sample, index) => (
				<div
					key={sample.radius + sample.color + sample.nativeInset}
					style={{
						position: 'absolute',
						left: 20 + (index % 3) * 180 + frame * 4,
						top: 20 + Math.floor(index / 3) * 120,
						width: 100,
						height: 80,
						boxSizing: 'border-box',
						padding: sample.nativeInset,
						backgroundClip: sample.nativeInset ? 'content-box' : 'border-box',
						borderRadius: sample.radius,
						backgroundColor: sample.color,
					}}
				/>
			))}
		</AbsoluteFill>
	);
};

export const nativeRoundedClipping = {
	component: NativeRoundedClipComponent,
	id: 'native-rounded-clipping',
	width: 540,
	height: 360,
	fps: 30,
	durationInFrames: 2,
} as const;
