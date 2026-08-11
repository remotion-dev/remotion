import {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	const ref = useRef<HTMLCanvasElement>(null);

	useLayoutEffect(() => {
		if (!ref.current) return;
		const ctx = ref.current.getContext('2d');
		if (!ctx) return;
		ctx.fillStyle = 'purple';
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
					opacity: 0,
				}}
				width={100}
				height={100}
			/>
		</AbsoluteFill>
	);
};

export const opacityZero = {
	component: Component,
	id: 'opacity-zero',
	width: 200,
	height: 200,
	fps: 25,
	durationInFrames: 1,
} as const;
