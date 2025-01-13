import {makeRect} from '@remotion/shapes';
import {
	makeMatrix3dTransform,
	MatrixTransform4D,
	reduceMatrices,
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
	const reffed = ref.current?.getClientRects();
	if (!reffed?.[0]) {
		throw new Error('No ref');
	}
	return {
		width: reffed[0].width / scale,
		height: reffed[0].height / scale,
	};
};

const transformations: MatrixTransform4D[] = [
	scaled(1.3),
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

		setSvgShape((p) => (p === null ? path.path : p));
	}, [scale]);

	const reduced = reduceMatrices(transformations);

	return (
		<AbsoluteFill className="flex justify-center items-center">
			<div
				ref={ref}
				style={{
					transformOrigin: 'top left',
					transform: svgShape ? makeMatrix3dTransform(reduced) : undefined,
				}}
				className="bg-red-700 text-white w-[300px] h-[300px] flex justify-center items-center font-sans text-2xl"
			>
				hi there
			</div>
			{svgShape ? <Svg transformation={reduced} svgShape={svgShape} /> : null}
		</AbsoluteFill>
	);
};
