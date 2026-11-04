import React, {useMemo} from 'react';
import {CanvasImage} from 'remotion';
import {
	CUTOUT_PAPER_COLOR,
	cutoutPaperEffects,
} from '../paper-disco/cutout-paper';

const makePaperTexture = (w: number, h: number, shadowPad: number) => {
	const canvasW = w + shadowPad * 2;
	const canvasH = h + shadowPad * 2;
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasW}" height="${canvasH}" viewBox="0 0 ${canvasW} ${canvasH}"><rect x="${shadowPad}" y="${shadowPad}" width="${w}" height="${h}" fill="${CUTOUT_PAPER_COLOR}"/></svg>`;
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
	// Leave transparent space around the paper so the shadow can render in full.
	const shadowPad = Math.ceil(80 / visualScale);
	const texture = useMemo(
		() => makePaperTexture(boxW, boxH, shadowPad),
		[boxW, boxH, shadowPad],
	);

	return (
		<div style={{width, height, ...style}}>
			<CanvasImage
				name={name}
				src={texture}
				width={boxW + shadowPad * 2}
				height={boxH + shadowPad * 2}
				fit="fill"
				style={{
					position: 'absolute',
					// HTML-in-canvas preserves this transform but drops negative layout offsets.
					translate: `${-pad - shadowPad}px ${-pad - shadowPad}px`,
				}}
				effects={cutoutPaperEffects({
					gridOpacity: 0.28,
					unit: 1 / visualScale,
					seed,
					edgeRoughness: null,
					shadowOpacity: 0.72,
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
