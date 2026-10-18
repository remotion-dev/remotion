import React, {useMemo} from 'react';
import {CanvasImage} from 'remotion';
import {
	CUTOUT_PAPER_COLOR,
	cutoutPaperEffects,
} from '../paper-disco/cutout-paper';

const makePaperTexture = (w: number, h: number) => {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${CUTOUT_PAPER_COLOR}"/></svg>`;
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

/**
 * Wraps a clip in a piece of white paper, in the same cut-out style as the
 * disco ball (see cutout-paper.ts). Give it the same width/height/scale/
 * translate the clip used to have; the clip itself fills the inner area.
 *
 * `visualScale` is the (approximate) scale the box is shown at, so padding,
 * torn edges, grid and shadow stay the same size on screen for every clip.
 */
export const PaperBox: React.FC<{
	readonly name: string;
	readonly width: number;
	readonly height: number;
	readonly visualScale: number;
	readonly padding?: number;
	readonly seed?: number;
	readonly style?: React.CSSProperties;
	readonly children: React.ReactNode;
}> = ({
	name,
	width,
	height,
	visualScale,
	padding = 40,
	seed = 1,
	style,
	children,
}) => {
	const pad = padding / visualScale;
	const boxW = Math.round(width + pad * 2);
	const boxH = Math.round(height + pad * 2);
	const texture = useMemo(() => makePaperTexture(boxW, boxH), [boxW, boxH]);

	return (
		<div style={{width, height, ...style}}>
			<CanvasImage
				name={name}
				src={texture}
				width={boxW}
				height={boxH}
				fit="fill"
				style={{position: 'absolute', left: -pad, top: -pad}}
				effects={cutoutPaperEffects({
					gridOpacity: null,
					unit: 1 / visualScale,
					seed,
					edgeRoughness: null,
				})}
			/>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					borderRadius: 6 / visualScale,
					overflow: 'hidden',
				}}
			>
				{children}
			</div>
		</div>
	);
};
