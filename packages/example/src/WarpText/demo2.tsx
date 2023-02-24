import opentype from 'opentype.js';
import {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';

import {getBoundingBox, resetPath, warpPath, WarpPathFn} from '@remotion/paths';

type FontInfo = {
	path: string;
};

// Recreating the album cover typography from https://en.wikipedia.org/wiki/So_Good_(Zara_Larsson_album)
const getPath = () => {
	return new Promise<FontInfo>((resolve, reject) => {
		opentype.load(staticFile('Roboto-Medium.ttf'), (err, font) => {
			if (err) {
				reject(err);
				return;
			}
			if (!font) {
				reject(new Error('No font found'));
				return;
			}

			const path = font.getPath('SO GOOD', 0, 150, 72);
			const p = path.toPathData(2);
			resolve({path: p});
		});
	});
};

function normalDistribution(x: number): number {
	return Math.exp(-(x ** 2) / 2) / Math.sqrt(2 * Math.PI);
}

export const WarpDemo2 = () => {
	const [path, setPath] = useState<string | null>(() => null);
	const ref = useRef<SVGSVGElement>(null);
	const frame = useCurrentFrame();

	useEffect(() => {
		getPath().then((p) => {
			setPath(p.path);
		});
	}, [frame]);

	if (!path) {
		return null;
	}

	const reset = resetPath(path);

	const boundingBox = getBoundingBox(reset);
	const height = boundingBox.y2 - boundingBox.y1;

	const start = 0.4 * height;
	const end = 0.47 * height;

	const warpPathFn: WarpPathFn = ({x, y}) => {
		const currentPos = y - start;

		const ease = normalDistribution(currentPos / (end - start));

		return {
			x: x + 50 * ease,
			y: y * 5,
		};
	};

	const warped = warpPath(reset, warpPathFn);
	const box = getBoundingBox(warped);

	const {x1, x2, y1, y2} = box;

	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'rgb(87 132 153)',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			{path ? (
				<svg
					ref={ref}
					style={{
						overflow: 'visible',
						height: 500,
					}}
					viewBox={`${x1} ${y1} ${x2 - x1} ${y2 - y1}`}
				>
					<path
						d={warped}
						fill="transparent"
						stroke="#E2BECC"
						strokeWidth={3}
					/>
				</svg>
			) : null}
		</AbsoluteFill>
	);
};
