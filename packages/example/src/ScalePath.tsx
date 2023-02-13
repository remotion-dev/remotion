import opentype from 'opentype.js';
import {useEffect, useRef, useState} from 'react';
import {
	AbsoluteFill,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

import {getBoundingBox, resetPath, scalePath} from '@remotion/paths';

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

export const ScalePath = () => {
	const [path, setPath] = useState<string | null>(() => null);
	const ref = useRef<SVGSVGElement>(null);
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const sprY =
		spring({
			fps,
			frame: frame - 30,
			config: {
				damping: 200,
			},
		}) *
			4 +
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

	const warped = scalePath(reset, 1, sprY);
	const box = getBoundingBox(warped);

	const {x1, x2, y1, y2} = box;

	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'black',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			{path ? (
				<svg
					ref={ref}
					style={{
						overflow: 'visible',
						height: 100 * sprY,
					}}
					viewBox={`${x1} ${y1} ${x2 - x1} ${y2 - y1}`}
				>
					<path d={warped} fill="pink" stroke="pink" strokeWidth={2} />
				</svg>
			) : null}
		</AbsoluteFill>
	);
};
