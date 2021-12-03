import {useCallback} from 'react';
import {useRef} from 'react';
import React from 'react';
import {ProcessingCanvas, P5Canvas} from '@remotion/p5';
import {useCurrentFrame, useVideoConfig} from 'remotion';

export const P5Global: React.FC = () => {
	const ref = useRef<P5Canvas>(null);
	const frame = useCurrentFrame();
	const {height, width} = useVideoConfig();

	const draw = useCallback(() => {
		const p5 = ref.current?.getSketch();
		if (!p5) {
			return;
		}
		p5.clear();

		p5.rotateZ(frame * 0.1);
		p5.rotateX(frame * 0.1);
		p5.torus(100, 20);
	}, [frame]);

	return (
		<ProcessingCanvas
			ref={ref}
			renderer="webgl"
			width={width}
			height={height}
			draw={draw}
		/>
	);
};
