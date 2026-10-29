import {dropShadow} from '@remotion/effects/drop-shadow';
import {pageTurn} from '@remotion/effects/page-turn';
import {paper} from '@remotion/effects/paper';
import {roughenEdges} from '@remotion/effects/roughen-edges';
import React, {useEffect, useMemo, useState} from 'react';
import {CanvasImage, random, useDelayRender} from 'remotion';
import {PAPER_SCAN_DATA_URL} from './paper-scan';

/**
 * An odd, hand-cut shape: a lopsided polygon with uneven corners,
 * like something snipped out of a magazine with scissors.
 */
const oddShapePath = (seed: string, w: number, h: number, pad: number) => {
	const cx = w / 2;
	const cy = h / 2;
	const rx = w / 2 - pad;
	const ry = h / 2 - pad;
	const n = 6 + Math.floor(random(`${seed}-n`) * 3);
	const offset = random(`${seed}-o`) * Math.PI;
	const pts: string[] = [];
	for (let i = 0; i < n; i++) {
		const a =
			offset + (i / n) * Math.PI * 2 + (random(`${seed}-a${i}`) - 0.5) * 0.5;
		const sq = 1 / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a)));
		const r = Math.min(sq, 1.25) * (0.8 + random(`${seed}-r${i}`) * 0.2);
		pts.push(
			`${(cx + Math.cos(a) * rx * r).toFixed(1)},${(cy + Math.sin(a) * ry * r).toFixed(1)}`,
		);
	}
	return `M${pts.join(' L')} Z`;
};

/** What is printed on a clipping. Lives inside the scrap's SVG, so it is one image. */
export type ClippingArt =
	| {
			readonly type: 'image';
			/** data: URL (an SVG data URL can't load remote images) */
			readonly href: string;
			/** Fraction of the clipping the artwork may fill */
			readonly scale: number;
			/** Key out a white background (e.g. a logo PNG on white) */
			readonly keyWhite: boolean;
	  }
	| {
			readonly type: 'path';
			readonly d: string;
			readonly viewBox: string;
			readonly fill: string;
			readonly scale: number;
	  };

const artMarkup = (art: ClippingArt, w: number, h: number) => {
	const aw = w * art.scale;
	const ah = h * art.scale;
	const x = (w - aw) / 2;
	const y = (h - ah) / 2;
	if (art.type === 'path') {
		return `<svg x="${x}" y="${y}" width="${aw}" height="${ah}" viewBox="${art.viewBox}" preserveAspectRatio="xMidYMid meet"><path d="${art.d}" fill="${art.fill}"/></svg>`;
	}

	return `<image href="${art.href}" x="${x}" y="${y}" width="${aw}" height="${ah}" preserveAspectRatio="xMidYMid meet"${art.keyWhite ? ' filter="url(#keywhite)"' : ''}/>`;
};

const makeScrapTexture = (
	seed: string,
	color: string,
	w: number,
	h: number,
	pad: number,
	art: ClippingArt,
) => {
	const path = oddShapePath(seed, w, h, pad);
	// keywhite: alpha = 4 * (3 - (r + g + b)), so white goes transparent while
	// colours and outlines stay opaque
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs><clipPath id="c"><path d="${path}"/></clipPath>
<filter id="keywhite" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -4 -4 -4 0 12"/></filter></defs>
<g clip-path="url(#c)">
<image href="${PAPER_SCAN_DATA_URL}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>
<rect width="${w}" height="${h}" fill="${color}" style="mix-blend-mode:multiply"/>
${artMarkup(art, w, h)}
</g>
</svg>`;
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

/** Fetches a (remote) asset as a data: URL so it can be embedded into an SVG. */
export const useDataUrl = (src: string | null): string | null => {
	const {delayRender, continueRender, cancelRender} = useDelayRender();
	const [dataUrl, setDataUrl] = useState<string | null>(null);
	useEffect(() => {
		if (src === null) {
			return;
		}

		const handle = delayRender(`Loading ${src} for a clipping`);
		let cancelled = false;
		fetch(src)
			.then((res) => {
				if (!res.ok) {
					throw new Error(`Failed to load ${src}: ${res.status}`);
				}

				return res.blob();
			})
			.then(
				(blob) =>
					new Promise<string>((resolve, reject) => {
						const reader = new FileReader();
						reader.onload = () => resolve(reader.result as string);
						reader.onerror = () => reject(reader.error);
						reader.readAsDataURL(blob);
					}),
			)
			.then((url) => {
				if (!cancelled) {
					setDataUrl(url);
				}

				continueRender(handle);
			})
			.catch((err) => cancelRender(err));
		return () => {
			cancelled = true;
			continueRender(handle);
		};
	}, [src, delayRender, continueRender, cancelRender]);
	return dataUrl;
};

/** Paper texture applied to whatever is printed on a clipping (logos etc). */
export const printedOnPaper = (seed: number) =>
	paper({
		amount: 0.8,
		colorFront: '#b9b2a4',
		colorBack: '#ffffff',
		contrast: 0.3,
		roughness: 0.45,
		fiber: 0.45,
		fiberSize: 0.2,
		crumples: 0.5,
		crumpleSize: 0.3,
		folds: 0.3,
		foldCount: 3,
		drops: 0.05,
		seed,
	});

/**
 * pageTurn() that lays a clipping down: at progress 0 the sheet is fully
 * curled away (nothing visible), at 1 it lies flat. `direction` is the fold
 * angle; the sheet unrolls from the opposite side. Fold position is in
 * pixels, so canvases of the same size turn in sync.
 */
export const pageTurnIn = ({
	progress,
	width,
	height,
	direction,
	radius,
	paperColor,
	render,
}: {
	readonly progress: number;
	readonly width: number;
	readonly height: number;
	readonly direction: number;
	readonly radius: number;
	readonly paperColor?: string;
	readonly render?: 'both' | 'front';
}) => {
	const rad = (direction * Math.PI) / 180;
	const nx = -Math.sin(rad);
	const ny = Math.cos(rad);
	const half = (Math.abs(nx) * width + Math.abs(ny) * height) / 2;
	const t0 = -half - radius - 2;
	const t1 = half + Math.PI * radius + 2;
	const t = t0 + (t1 - t0) * progress;
	return pageTurn({
		foldPosition: [
			(width / 2 + nx * t) / width,
			(height / 2 + ny * t) / height,
		],
		foldDirection: direction,
		foldRadius: radius,
		paperColor,
		render,
		backPageOpacity: 0.15,
	});
};

/**
 * Ransom-note style clipping: an odd-shaped scrap of textured paper with the
 * artwork printed on it, all in ONE canvas, so paper texture, torn edge, page
 * turn and shadow apply to the sticker as a whole.
 */
export const RansomClipping: React.FC<{
	readonly name: string;
	readonly seed: string;
	readonly color: string;
	readonly width: number;
	readonly height: number;
	readonly art: ClippingArt;
	/** 0 = curled away, 1 = lying flat (see pageTurnIn) */
	readonly turn: number;
	readonly turnDirection: number;
	readonly turnRadius: number;
	/** Size multiplier for padding, torn edge and shadow, so a bigger clipping keeps its exact shape */
	readonly unit: number;
}> = ({
	name,
	seed,
	color,
	width,
	height,
	art,
	turn,
	turnDirection,
	turnRadius,
	unit,
}) => {
	const pad = 46 * unit;
	const src = useMemo(
		() => makeScrapTexture(seed, color, width, height, pad, art),
		[seed, color, width, height, pad, art],
	);
	const seedNum = (seed.length * 13 + seed.charCodeAt(0)) % 1000;
	return (
		<CanvasImage
			name={name}
			src={src}
			width={width}
			height={height}
			fit="fill"
			effects={[
				printedOnPaper(seedNum),
				roughenEdges({
					amount: 1,
					border: 6 * unit,
					scale: 0.1 / unit,
					seed: (seedNum * 7) % 1000,
				}),
				dropShadow({
					radius: 14 * unit,
					offsetX: 9 * unit,
					offsetY: 15 * unit,
					opacity: 0.65,
					color: '#000000',
				}),
				// Last on purpose: a WebGL effect after a WebGPU one currently comes
				// out upside down (Remotion bug, being fixed). The shadow turns with
				// the sheet.
				pageTurnIn({
					progress: turn,
					width,
					height,
					direction: turnDirection,
					radius: turnRadius,
					paperColor: color,
				}),
			]}
		/>
	);
};
