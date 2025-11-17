import {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender} from 'remotion';

export const TriangleComp: React.FC = () => {
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
