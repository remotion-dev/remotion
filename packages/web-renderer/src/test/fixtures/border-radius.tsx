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
	fps: 30,
	durationInFrames: 100,
} as const;
