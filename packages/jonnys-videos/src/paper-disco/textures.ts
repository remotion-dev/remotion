import {random} from 'remotion';

const toDataUrl = (svg: string) =>
	`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

// Black ballpoint on white paper (the paper cut-outs sit on a dark background)
export const BALLPEN_INK = '#17171a';
export const CUTOUT_PAPER = '#ffffff';

const wobblyLine = (
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	seed: string,
	wobble: number,
) => {
	const segments = 6;
	const pts: string[] = [`M${x1.toFixed(1)} ${y1.toFixed(1)}`];
	for (let i = 1; i <= segments; i++) {
		const t = i / segments;
		const dx = i === segments ? 0 : (random(`${seed}-x${i}`) - 0.5) * wobble;
		const dy = i === segments ? 0 : (random(`${seed}-y${i}`) - 0.5) * wobble;
		pts.push(
			`L${(x1 + (x2 - x1) * t + dx).toFixed(1)} ${(y1 + (y2 - y1) * t + dy).toFixed(1)}`,
		);
	}
	return pts.join(' ');
};

/**
 * Equirectangular texture for the disco ball, drawn like a ballpoint pen
 * sketch: white tiles, slightly wobbly ink lines, a few hatched tiles.
 */
export const makeDiscoBallTexture = ({
	rows = 12,
	columns = 24,
	seed = 'paper-disco',
	ink = BALLPEN_INK,
	paperColor = CUTOUT_PAPER,
}: {
	rows?: number;
	columns?: number;
	seed?: string;
	ink?: string;
	paperColor?: string;
} = {}) => {
	const width = 2048;
	const height = 1024;
	const tileW = width / columns;
	const tileH = height / rows;

	const hatched: string[] = [];
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < columns; c++) {
			if (random(`${seed}-${r}-${c}`) < 0.04) {
				hatched.push(
					`<rect x="${c * tileW}" y="${r * tileH}" width="${tileW}" height="${tileH}" fill="url(#hatch)"/>`,
				);
			}
		}
	}

	const lines: string[] = [];
	for (let r = 1; r < rows; r++) {
		lines.push(wobblyLine(0, r * tileH, width, r * tileH, `${seed}-h${r}`, 7));
	}
	for (let c = 0; c < columns; c++) {
		lines.push(wobblyLine(c * tileW, 0, c * tileW, height, `${seed}-v${c}`, 7));
	}

	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
<pattern id="hatch" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
<line x1="0" y1="0" x2="0" y2="16" stroke="${ink}" stroke-width="4" opacity="0.75"/>
</pattern>
</defs>
<rect width="${width}" height="${height}" fill="${paperColor}"/>
${hatched.join('')}
<g stroke="${ink}" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.92">${lines.map((d) => `<path d="${d}"/>`).join('')}</g>
</svg>`;
	return toDataUrl(svg);
};

/** A plain white disc, used as the paper cut-out the ball is drawn on. */
export const makeDiscTexture = (
	size: number,
	radius: number,
	color = CUTOUT_PAPER,
) => {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="${color}"/></svg>`;
	return toDataUrl(svg);
};

/**
 * Lined notebook paper with a red margin and punched holes.
 * The holes are real transparency, so whatever is underneath shows through.
 */
export const makeNotebookTexture = ({
	width,
	height,
	lineSpacing = 58,
	firstLine = 120,
	margin = 150,
	holes = true,
	holeSide = 'left',
}: {
	width: number;
	height: number;
	lineSpacing?: number;
	firstLine?: number;
	margin?: number;
	holes?: boolean;
	holeSide?: 'left' | 'top';
}) => {
	const lines: string[] = [];
	for (let y = firstLine; y < height; y += lineSpacing) {
		lines.push(`<line x1="0" y1="${y}" x2="${width}" y2="${y}"/>`);
	}

	const holeEls: string[] = [];
	if (holes) {
		if (holeSide === 'left') {
			const count = Math.max(2, Math.round(height / 380));
			for (let i = 0; i < count; i++) {
				const y = ((i + 0.5) / count) * height;
				holeEls.push(`<circle cx="62" cy="${y}" r="36" fill="black"/>`);
			}
		} else {
			const count = Math.max(2, Math.round(width / 300));
			for (let i = 0; i < count; i++) {
				const x = ((i + 0.5) / count) * width;
				holeEls.push(`<circle cx="${x}" cy="62" r="24" fill="black"/>`);
			}
		}
	}

	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
<mask id="holes"><rect width="${width}" height="${height}" fill="white"/>${holeEls.join('')}</mask>
</defs>
<g mask="url(#holes)">
<rect width="${width}" height="${height}" fill="${CUTOUT_PAPER}"/>
<g stroke="#a9cdf0" stroke-width="2" opacity="0.8">${lines.join('')}</g>
<line x1="${margin}" y1="0" x2="${margin}" y2="${height}" stroke="#f19a9a" stroke-width="2.5"/>
</g>
</svg>`;
	return toDataUrl(svg);
};

/** A flat sheet of colored construction paper (for cutout stars etc). */
export const makeSolidPaperTexture = ({
	width,
	height,
	color,
	path,
}: {
	width: number;
	height: number;
	color: string;
	path?: string;
}) => {
	const shape = path
		? `<path d="${path}" fill="${color}"/>`
		: `<rect width="${width}" height="${height}" fill="${color}"/>`;
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${shape}</svg>`;
	return toDataUrl(svg);
};

export const starPath = (
	cx: number,
	cy: number,
	outer: number,
	inner: number,
	points = 5,
) => {
	const parts: string[] = [];
	for (let i = 0; i < points * 2; i++) {
		const r = i % 2 === 0 ? outer : inner;
		const a = (Math.PI * i) / points - Math.PI / 2;
		parts.push(
			`${i === 0 ? 'M' : 'L'}${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`,
		);
	}
	return parts.join(' ') + ' Z';
};
