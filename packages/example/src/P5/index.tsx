import {useCallback} from 'react';
import {useRef} from 'react';
import React from 'react';
import {ProcessingCanvas, P5Canvas} from '@remotion/p5';
import {useVideoConfig} from 'remotion';

let y = 0;
let direction = '^';

export const P5Demo: React.FC = () => {
	const ref = useRef<P5Canvas>(null);
	const {height, width} = useVideoConfig();

	const draw = useCallback(() => {
		const p5 = ref.current?.getSketch();
		if (!p5) {
			return;
		}

		p5.background(0);
		p5.fill(255, y * 1.3, 0);
		p5.ellipse(p5.width / 2, y, 50);
		if (y > p5.height) direction = '';
		if (y < 0) {
			direction = '^';
		}
		if (direction === '^') y += 8;
		else y -= 4;
	}, []);

	return (
		<ProcessingCanvas ref={ref} width={width} height={height} draw={draw} />
	);
};
