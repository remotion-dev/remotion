import {CameraMotionBlur} from '@remotion/motion-blur';
import {getBoundingBox, resetPath, warpPath, WarpPathFn} from '@remotion/paths';
import opentype from 'opentype.js';
import React, {useEffect, useRef, useState} from 'react';
import {
	AbsoluteFill,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

type FontInfo = {
	path: string;
};

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

			const path = font.getPath('REMOTION', 0, 150, 72);
			const p = path.toPathData(2);
			resolve({path: p});
		});
	});
};

export const WarpDemo = () => {
	const [path, setPath] = useState<string | null>(() => null);
	const ref = useRef<SVGSVGElement>(null);
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const sprX =
		spring({
			fps,
			frame,
			config: {
				damping: 200,
			},
		}) *
			2.5 +
		1;
	const sprY =
		spring({
			fps,
			frame: frame - 30,
			config: {
				damping: 200,
			},
		}) *
			2.5 +
		1;

	useEffect(() => {
		getPath().then((p) => {
			setPath(p.path);
		});
	}, [frame]);

	if (!path) {
		return null;
	}

	const reset = resetPath(path);

	const warpPathFn: WarpPathFn = ({x, y}) => ({
		x: x * sprY + Math.sin(y / 4 + frame / 20) * 5,
		y: y * sprX,
	});

	const warped = warpPath(reset, warpPathFn);
	const box = getBoundingBox(warped);

	const {x1, x2, y1, y2} = box;

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			{path ? (
				<svg
					ref={ref}
					style={{
						overflow: 'visible',
						height: 50 * sprX,
					}}
					viewBox={`${x1} ${y1} ${x2 - x1} ${y2 - y1}`}
				>
					<path d={warped} fill="black" stroke="black" strokeWidth={3} />
				</svg>
			) : null}
		</AbsoluteFill>
	);
};

export const WarpDemoOuter: React.FC = () => {
	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				background: 'white',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<CameraMotionBlur samples={5} shutterAngle={180}>
				<WarpDemo />
			</CameraMotionBlur>
		</div>
	);
};
