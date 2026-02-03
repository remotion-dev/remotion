import {useCallback, useRef, useState} from 'react';

const DURATION = 300;

export const useHeartAnimation = () => {
	const [scale, setScale] = useState(1);
	const [roundness, setRoundness] = useState(0.09);
	const rafRef = useRef(0);

	const animate = useCallback(() => {
		cancelAnimationFrame(rafRef.current);
		const start = performance.now();

		const tick = (now: number) => {
			const elapsed = now - start;
			const t = Math.min(elapsed / DURATION, 1);
			// ease-out quad for the up phase, then ease-in for down
			const half = t < 0.5 ? t * 2 : (1 - t) * 2;
			const eased = half * (2 - half); // ease-out quad

			setScale(1 + 0.1 * eased);
			setRoundness(0.09 + 0.1 * eased);

			if (t < 1) {
				rafRef.current = requestAnimationFrame(tick);
			} else {
				setScale(1);
				setRoundness(0.09);
			}
		};

		rafRef.current = requestAnimationFrame(tick);
	}, []);

	return {scale, roundness, animate};
};
