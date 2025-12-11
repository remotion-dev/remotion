import {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	const ref = useRef<HTMLCanvasElement>(null);

	useLayoutEffect(() => {
		if (!ref.current) return;
		const ctx = ref.current.getContext('2d');
		if (!ctx) return;
		ctx.fillStyle = 'blue';
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
			<div style={{opacity: 0.5}}>
				<canvas
					ref={ref}
					style={{
						opacity: 0.6,
					}}
					width={100}
					height={100}
				/>
			</div>
		</AbsoluteFill>
	);
};

export const opacityNested = {
	component: Component,
	id: 'opacity-nested',
	width: 200,
	height: 200,
	fps: 25,
	durationInFrames: 1,
} as const;
