import {useCallback, useEffect} from 'react';
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
		console.log(frame);

		p5.background(250);

		p5.translate(0, 0, 0);
		p5.normalMaterial();
		p5.push();
		p5.rotateZ(frame * 0.01);
		p5.rotateX(frame * 0.01);
		p5.rotateY(frame * 0.01);
		p5.plane(70);
		p5.pop();
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
