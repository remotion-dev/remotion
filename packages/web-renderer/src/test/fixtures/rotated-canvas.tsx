import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender} from 'remotion';

const Component: React.FC = () => {
	const [handle] = useState(() => delayRender());
	const ref = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (!ref.current) return;
		const ctx = ref.current.getContext('2d');
		if (!ctx) return;
		ctx.fillStyle = 'orange';
		ctx.fillRect(0, 0, 50, 50);
		continueRender(handle);
	}, [handle]);

	return (
		<AbsoluteFill
			style={{
				transform: 'rotate(45deg)',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<canvas
				ref={ref}
				width="50"
				height="50"
				style={{width: '50px', height: '50px'}}
			/>
		</AbsoluteFill>
	);
};

export const rotatedCanvas = {
	component: Component,
	id: 'rotated-canvas',
	width: 100,
	height: 100,
	fps: 30,
	durationInFrames: 100,
} as const;
