import {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	const ref = useRef<HTMLCanvasElement>(null);

	useLayoutEffect(() => {
		if (!ref.current) return;
		const ctx = ref.current.getContext('2d');
		if (!ctx) return;
		const gradient = ctx.createLinearGradient(0, 0, 100, 100);
		gradient.addColorStop(0, 'blue');
		gradient.addColorStop(1, 'green');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, 100, 100);
	}, []);

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: 'white',
			}}
		>
			<canvas
				ref={ref}
				style={{
					borderRadius: '50px / 25px',
				}}
				width={100}
				height={100}
			/>
		</AbsoluteFill>
	);
};

export const borderRadiusElliptical = {
	component: Component,
	id: 'border-radius-elliptical',
	width: 200,
	height: 200,
	fps: 25,
	durationInFrames: 1,
} as const;
