import {makeRect} from '@remotion/shapes';
import {
	MatrixTransform4D,
	rotateX,
	rotateY,
	scaled,
} from '@remotion/svg-3d-engine';
import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, useCurrentScale} from 'remotion';
import {Svg} from './Svg';

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

const transformations: MatrixTransform4D[] = [
	scaled(2),
	rotateY(Math.PI / 8),
	rotateX(Math.PI / 8),
];

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
				<Svg transformations={transformations} svgShape={svgShape} />
			) : null}
		</AbsoluteFill>
	);
};
