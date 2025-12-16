import {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	const ref = useRef<HTMLCanvasElement>(null);

	useLayoutEffect(() => {
		if (!ref.current) return;
		const ctx = ref.current.getContext('2d');
		if (!ctx) return;
		ctx.fillStyle = 'green';
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
			<div
				style={{
					perspective: '600px',
					perspectiveOrigin: 'left top',
				}}
			>
				<canvas
					ref={ref}
					style={{
						transform: 'rotateY(45deg)',
					}}
					width={100}
					height={100}
				/>
			</div>
		</AbsoluteFill>
	);
};

export const perspectiveOrigin = {
	component: Component,
	id: 'perspective-origin',
	width: 200,
	height: 200,
	fps: 25,
	durationInFrames: 1,
} as const;
