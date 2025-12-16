import {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	const ref = useRef<HTMLCanvasElement>(null);

	useLayoutEffect(() => {
		if (!ref.current) return;
		const ctx = ref.current.getContext('2d');
		if (!ctx) return;
		ctx.fillStyle = 'blue';
		ctx.fillRect(0, 0, 80, 80);
	}, []);

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: 'white',
			}}
		>
			<div style={{perspective: '800px', transformStyle: 'preserve-3d'}}>
				<div
					style={{
						transform: 'rotateX(50deg)',
						transformStyle: 'preserve-3d',
						perspective: '200px',
					}}
				>
					<div
						style={{
							width: 80,
							height: 80,
							backgroundColor: 'blue',
							transformStyle: 'preserve-3d',
							transform: 'rotateY(50deg)',
						}}
					/>
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const perspectiveNested = {
	component: Component,
	id: 'perspective-nested',
	width: 200,
	height: 200,
	fps: 25,
	durationInFrames: 1,
} as const;
