import {getBoundingBox} from '@remotion/paths';
import {makeRect} from '@remotion/shapes';
import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, useCurrentScale} from 'remotion';

const measure = (
	ref: React.RefObject<HTMLDivElement | null>,
	scale: number,
) => {
	const reffed = ref.current?.getBoundingClientRect();
	if (!reffed) {
		throw new Error('No ref');
	}
	return {
		width: reffed.width / scale,
		height: reffed.height / scale,
	};
};

export const ThreeDEngine = () => {
	const ref = useRef<HTMLDivElement>(null);
	const [svgShape, setSvgShape] = useState<string | null>(null);
	const scale = useCurrentScale();

	useEffect(() => {
		const measured = measure(ref, scale);
		const path = makeRect({
			width: measured.width,
			height: measured.height,
		});

		setSvgShape(path.path);
	}, [scale]);

	return (
		<AbsoluteFill className="flex justify-center items-center">
			<div
				ref={ref}
				className="bg-red-700 text-white w-[300px] h-[300px] flex justify-center items-center font-sans text-2xl"
			>
				hi there
			</div>
			{svgShape ? (
				<svg
					viewBox={getBoundingBox(svgShape).viewBox}
					style={{
						height: getBoundingBox(svgShape).height,
						width: getBoundingBox(svgShape).width,
						overflow: 'visible',
					}}
				>
					<path d={svgShape} fill="gray" stroke="black" strokeWidth="1" />
				</svg>
			) : null}
		</AbsoluteFill>
	);
};
