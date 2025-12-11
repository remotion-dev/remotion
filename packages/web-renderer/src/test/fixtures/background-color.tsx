import {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill} from 'remotion';

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
			<div
				style={{
					backgroundColor: 'red',
					width: 100,
					height: 100,
					borderRadius: 20,
				}}
			/>
		</AbsoluteFill>
	);
};

export const backgroundColor = {
	component: Component,
	id: 'background-color',
	width: 200,
	height: 200,
	fps: 25,
	durationInFrames: 1,
} as const;
