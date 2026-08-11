import React, {useEffect, useMemo, useRef} from 'react';

const viewBox = 100;
const lines = 8;

// Generated from https://github.com/remotion-dev/template-next/commit/9282c93f7c51ada31a42e18a94680fa09a14eee3
const translated =
	'M 44 0 L 50 0 a 6 6 0 0 1 6 6 L 56 26 a 6 6 0 0 1 -6 6 L 50 32 a 6 6 0 0 1 -6 -6 L 44 6 a 6 6 0 0 1 6 -6 Z';

export const Spinner: React.FC<{
	readonly size: number;
	readonly duration: number;
}> = ({size, duration}) => {
	const style = useMemo(() => {
		return {
			width: size,
			height: size,
		};
	}, [size]);

	const pathsRef = useRef<(SVGPathElement | null)[]>([]);

	useEffect(() => {
		const animate = () => {
			const now = performance.now();
			for (let index = 0; index < lines; index++) {
				const path = pathsRef.current[index];
				if (!path) continue;
				// Calculate current opacity using the same animation as before
				const progress =
					((now / 1000 - index * (duration / lines)) % duration) / duration;
				// Animation: opacity 1 → 0.15
				const opacity = 1 - 0.85 * progress;
				path.style.opacity = opacity.toString();
			}

			requestAnimationFrame(animate);
		};

		const id = requestAnimationFrame(animate);
		return () => {
			cancelAnimationFrame(id);
		};
	}, [duration]);

	return (
		<svg style={style} viewBox={`0 0 ${viewBox} ${viewBox}`}>
			{new Array(lines).fill(true).map((_, index) => {
				return (
					<path
						// eslint-disable-next-line react/no-array-index-key
						key={index}
						// @ts-expect-error
						// eslint-disable-next-line no-return-assign
						ref={(el) => (pathsRef.current[index] = el)}
						style={{
							rotate: `${(index * Math.PI * 2) / lines}rad`,
							transformOrigin: 'center center',
							opacity: 1,
						}}
						d={translated}
						fill={'currentColor'}
					/>
				);
			})}
		</svg>
	);
};
