import {NoReactInternals} from 'remotion/no-react';

export type Rgba = {
	r: number;
	g: number;
	b: number;
	a: number;
};

export type Hsva = {
	h: number;
	s: number;
	v: number;
	a: number;
};

export const clamp = (value: number, min: number, max: number) => {
	return Math.min(Math.max(value, min), max);
};

const componentToHex = (c: number) => {
	return Math.round(clamp(c, 0, 255))
		.toString(16)
		.padStart(2, '0');
};

// Always returns a normalized {r, g, b, a (0-255)} object,
// regardless of whether the input was a hex, rgb(), rgba(), or named color.
// Falls back to opaque black when parsing fails.
export const parseAnyColor = (input: string): Rgba => {
	try {
		const argb = NoReactInternals.processColor(input)
			.toString(16)
			.padStart(8, '0');
		const a = parseInt(argb.slice(0, 2), 16);
		const r = parseInt(argb.slice(2, 4), 16);
		const g = parseInt(argb.slice(4, 6), 16);
		const b = parseInt(argb.slice(6, 8), 16);
		return {r, g, b, a};
	} catch {
		return {r: 0, g: 0, b: 0, a: 255};
	}
};

export const formatRgbHex = ({r, g, b}: {r: number; g: number; b: number}) => {
	return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
};

export const formatRgba = ({r, g, b, a}: Rgba): string => {
	if (a >= 255) {
		return formatRgbHex({r, g, b});
	}

	const opacity = Number((a / 255).toFixed(2));
	return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${opacity})`;
};

export const rgbToHsv = ({
	r,
	g,
	b,
}: {
	r: number;
	g: number;
	b: number;
}): Hsva => {
	const rn = r / 255;
	const gn = g / 255;
	const bn = b / 255;

	const max = Math.max(rn, gn, bn);
	const min = Math.min(rn, gn, bn);
	const delta = max - min;

	let h = 0;
	if (delta !== 0) {
		if (max === rn) {
			h = ((gn - bn) / delta) % 6;
		} else if (max === gn) {
			h = (bn - rn) / delta + 2;
		} else {
			h = (rn - gn) / delta + 4;
		}

		h *= 60;
		if (h < 0) {
			h += 360;
		}
	}

	const s = max === 0 ? 0 : delta / max;
	const v = max;

	return {h, s, v, a: 1};
};

export const hsvToRgb = ({
	h,
	s,
	v,
}: {
	h: number;
	s: number;
	v: number;
}): {r: number; g: number; b: number} => {
	const c = v * s;
	const hh = (h % 360) / 60;
	const x = c * (1 - Math.abs((hh % 2) - 1));

	let r1 = 0;
	let g1 = 0;
	let b1 = 0;

	if (hh >= 0 && hh < 1) {
		r1 = c;
		g1 = x;
	} else if (hh >= 1 && hh < 2) {
		r1 = x;
		g1 = c;
	} else if (hh >= 2 && hh < 3) {
		g1 = c;
		b1 = x;
	} else if (hh >= 3 && hh < 4) {
		g1 = x;
		b1 = c;
	} else if (hh >= 4 && hh < 5) {
		r1 = x;
		b1 = c;
	} else {
		r1 = c;
		b1 = x;
	}

	const m = v - c;
	return {
		r: Math.round((r1 + m) * 255),
		g: Math.round((g1 + m) * 255),
		b: Math.round((b1 + m) * 255),
	};
};

export const rgbaToHsva = (rgba: Rgba): Hsva => {
	const {h, s, v} = rgbToHsv(rgba);
	return {h, s, v, a: rgba.a / 255};
};

export const hsvaToRgba = (hsva: Hsva): Rgba => {
	const {r, g, b} = hsvToRgb(hsva);
	return {r, g, b, a: Math.round(hsva.a * 255)};
};
