/**
 * Copied from:
 * https://github.com/software-mansion/react-native-reanimated/blob/master/src/reanimated2/Colors.ts
 */

/* eslint no-bitwise: 0 */
import {interpolate} from './interpolate';

interface RBG {
	r: number;
	g: number;
	b: number;
}

interface HSV {
	h: number;
	s: number;
	v: number;
}

type MatcherType = RegExp | undefined;

// var INTEGER = '[-+]?\\d+';
const NUMBER = '[-+]?\\d*\\.?\\d+';
const PERCENTAGE = NUMBER + '%';

function call(...args: unknown[]): string {
	return '\\(\\s*(' + args.join(')\\s*,\\s*(') + ')\\s*\\)';
}

// matchers use RegExp objects which needs to be created separately on JS and on
// the UI thread. We keep separate cache of Regexes for UI and JS using the below
// objects, then pick the right cache in getMatchers() method.
type Matchers = {
	rgb: MatcherType;
	rgba: MatcherType;
	hsl: MatcherType;
	hsla: MatcherType;
	hex3: MatcherType;
	hex4: MatcherType;
	hex5: MatcherType;
	hex6: MatcherType;
	hex8: MatcherType;
};
function getMatchers(): Matchers {
	const cachedMatchers: Matchers = {
		rgb: undefined,
		rgba: undefined,
		hsl: undefined,
		hsla: undefined,
		hex3: undefined,
		hex4: undefined,
		hex5: undefined,
		hex6: undefined,
		hex8: undefined,
	};
	if (cachedMatchers.rgb === undefined) {
		cachedMatchers.rgb = new RegExp('rgb' + call(NUMBER, NUMBER, NUMBER));
		cachedMatchers.rgba = new RegExp(
			'rgba' + call(NUMBER, NUMBER, NUMBER, NUMBER)
		);
		cachedMatchers.hsl = new RegExp(
			'hsl' + call(NUMBER, PERCENTAGE, PERCENTAGE)
		);
		cachedMatchers.hsla = new RegExp(
			'hsla' + call(NUMBER, PERCENTAGE, PERCENTAGE, NUMBER)
		);
		cachedMatchers.hex3 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/;
		cachedMatchers.hex4 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/;
		cachedMatchers.hex6 = /^#([0-9a-fA-F]{6})$/;
		cachedMatchers.hex8 = /^#([0-9a-fA-F]{8})$/;
	}
	return cachedMatchers;
}

function hue2rgb(p: number, q: number, t: number): number {
	if (t < 0) {
		t += 1;
	}
	if (t > 1) {
		t -= 1;
	}
	if (t < 1 / 6) {
		return p + (q - p) * 6 * t;
	}
	if (t < 1 / 2) {
		return q;
	}
	if (t < 2 / 3) {
		return p + (q - p) * (2 / 3 - t) * 6;
	}
	return p;
}

function hslToRgb(h: number, s: number, l: number): number {
	const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	const p = 2 * l - q;
	const r = hue2rgb(p, q, h + 1 / 3);
	const g = hue2rgb(p, q, h);
	const b = hue2rgb(p, q, h - 1 / 3);

	return (
		(Math.round(r * 255) << 24) |
		(Math.round(g * 255) << 16) |
		(Math.round(b * 255) << 8)
	);
}

function parse255(str: string): number {
	const int = Number.parseInt(str, 10);
	if (int < 0) {
		return 0;
	}
	if (int > 255) {
		return 255;
	}
	return int;
}

function parse360(str: string): number {
	const int = Number.parseFloat(str);
	return (((int % 360) + 360) % 360) / 360;
}

function parse1(str: string): number {
	const num = Number.parseFloat(str);
	if (num < 0) {
		return 0;
	}
	if (num > 1) {
		return 255;
	}
	return Math.round(num * 255);
}

function parsePercentage(str: string): number {
	// parseFloat conveniently ignores the final %
	const int = Number.parseFloat(str);
	if (int < 0) {
		return 0;
	}
	if (int > 100) {
		return 1;
	}
	return int / 100;
}

const names: any = {
	transparent: 0x00000000,

	// http://www.w3.org/TR/css3-color/#svg-color
	aliceblue: 0xf0f8ffff,
	antiquewhite: 0xfaebd7ff,
	aqua: 0x00ffffff,
	aquamarine: 0x7fffd4ff,
	azure: 0xf0ffffff,
	beige: 0xf5f5dcff,
	bisque: 0xffe4c4ff,
	black: 0x000000ff,
	blanchedalmond: 0xffebcdff,
	blue: 0x0000ffff,
	blueviolet: 0x8a2be2ff,
	brown: 0xa52a2aff,
	burlywood: 0xdeb887ff,
	burntsienna: 0xea7e5dff,
	cadetblue: 0x5f9ea0ff,
	chartreuse: 0x7fff00ff,
	chocolate: 0xd2691eff,
	coral: 0xff7f50ff,
	cornflowerblue: 0x6495edff,
	cornsilk: 0xfff8dcff,
	crimson: 0xdc143cff,
	cyan: 0x00ffffff,
	darkblue: 0x00008bff,
	darkcyan: 0x008b8bff,
	darkgoldenrod: 0xb8860bff,
	darkgray: 0xa9a9a9ff,
	darkgreen: 0x006400ff,
	darkgrey: 0xa9a9a9ff,
	darkkhaki: 0xbdb76bff,
	darkmagenta: 0x8b008bff,
	darkolivegreen: 0x556b2fff,
	darkorange: 0xff8c00ff,
	darkorchid: 0x9932ccff,
	darkred: 0x8b0000ff,
	darksalmon: 0xe9967aff,
	darkseagreen: 0x8fbc8fff,
	darkslateblue: 0x483d8bff,
	darkslategray: 0x2f4f4fff,
	darkslategrey: 0x2f4f4fff,
	darkturquoise: 0x00ced1ff,
	darkviolet: 0x9400d3ff,
	deeppink: 0xff1493ff,
	deepskyblue: 0x00bfffff,
	dimgray: 0x696969ff,
	dimgrey: 0x696969ff,
	dodgerblue: 0x1e90ffff,
	firebrick: 0xb22222ff,
	floralwhite: 0xfffaf0ff,
	forestgreen: 0x228b22ff,
	fuchsia: 0xff00ffff,
	gainsboro: 0xdcdcdcff,
	ghostwhite: 0xf8f8ffff,
	gold: 0xffd700ff,
	goldenrod: 0xdaa520ff,
	gray: 0x808080ff,
	green: 0x008000ff,
	greenyellow: 0xadff2fff,
	grey: 0x808080ff,
	honeydew: 0xf0fff0ff,
	hotpink: 0xff69b4ff,
	indianred: 0xcd5c5cff,
	indigo: 0x4b0082ff,
	ivory: 0xfffff0ff,
	khaki: 0xf0e68cff,
	lavender: 0xe6e6faff,
	lavenderblush: 0xfff0f5ff,
	lawngreen: 0x7cfc00ff,
	lemonchiffon: 0xfffacdff,
	lightblue: 0xadd8e6ff,
	lightcoral: 0xf08080ff,
	lightcyan: 0xe0ffffff,
	lightgoldenrodyellow: 0xfafad2ff,
	lightgray: 0xd3d3d3ff,
	lightgreen: 0x90ee90ff,
	lightgrey: 0xd3d3d3ff,
	lightpink: 0xffb6c1ff,
	lightsalmon: 0xffa07aff,
	lightseagreen: 0x20b2aaff,
	lightskyblue: 0x87cefaff,
	lightslategray: 0x778899ff,
	lightslategrey: 0x778899ff,
	lightsteelblue: 0xb0c4deff,
	lightyellow: 0xffffe0ff,
	lime: 0x00ff00ff,
	limegreen: 0x32cd32ff,
	linen: 0xfaf0e6ff,
	magenta: 0xff00ffff,
	maroon: 0x800000ff,
	mediumaquamarine: 0x66cdaaff,
	mediumblue: 0x0000cdff,
	mediumorchid: 0xba55d3ff,
	mediumpurple: 0x9370dbff,
	mediumseagreen: 0x3cb371ff,
	mediumslateblue: 0x7b68eeff,
	mediumspringgreen: 0x00fa9aff,
	mediumturquoise: 0x48d1ccff,
	mediumvioletred: 0xc71585ff,
	midnightblue: 0x191970ff,
	mintcream: 0xf5fffaff,
	mistyrose: 0xffe4e1ff,
	moccasin: 0xffe4b5ff,
	navajowhite: 0xffdeadff,
	navy: 0x000080ff,
	oldlace: 0xfdf5e6ff,
	olive: 0x808000ff,
	olivedrab: 0x6b8e23ff,
	orange: 0xffa500ff,
	orangered: 0xff4500ff,
	orchid: 0xda70d6ff,
	palegoldenrod: 0xeee8aaff,
	palegreen: 0x98fb98ff,
	paleturquoise: 0xafeeeeff,
	palevioletred: 0xdb7093ff,
	papayawhip: 0xffefd5ff,
	peachpuff: 0xffdab9ff,
	peru: 0xcd853fff,
	pink: 0xffc0cbff,
	plum: 0xdda0ddff,
	powderblue: 0xb0e0e6ff,
	purple: 0x800080ff,
	rebeccapurple: 0x663399ff,
	red: 0xff0000ff,
	rosybrown: 0xbc8f8fff,
	royalblue: 0x4169e1ff,
	saddlebrown: 0x8b4513ff,
	salmon: 0xfa8072ff,
	sandybrown: 0xf4a460ff,
	seagreen: 0x2e8b57ff,
	seashell: 0xfff5eeff,
	sienna: 0xa0522dff,
	silver: 0xc0c0c0ff,
	skyblue: 0x87ceebff,
	slateblue: 0x6a5acdff,
	slategray: 0x708090ff,
	slategrey: 0x708090ff,
	snow: 0xfffafaff,
	springgreen: 0x00ff7fff,
	steelblue: 0x4682b4ff,
	tan: 0xd2b48cff,
	teal: 0x008080ff,
	thistle: 0xd8bfd8ff,
	tomato: 0xff6347ff,
	turquoise: 0x40e0d0ff,
	violet: 0xee82eeff,
	wheat: 0xf5deb3ff,
	white: 0xffffffff,
	whitesmoke: 0xf5f5f5ff,
	yellow: 0xffff00ff,
	yellowgreen: 0x9acd32ff,
};

function normalizeColor(color: unknown): number | null {
	if (typeof color === 'number') {
		if (color >>> 0 === color && color >= 0 && color <= 0xffffffff) {
			return color;
		}
		return null;
	}

	if (typeof color !== 'string') {
		return null;
	}

	const matchers = getMatchers();

	let match: RegExpExecArray | null;

	// Ordered based on occurrences on Facebook codebase
	if (matchers.hex6) {
		if ((match = matchers.hex6.exec(color))) {
			return Number.parseInt(match[1] + 'ff', 16) >>> 0;
		}
	}

	if (names[color] !== undefined) {
		return names[color];
	}
	if (matchers.rgb) {
		if ((match = matchers.rgb.exec(color))) {
			return (
				// b
				((parse255(match[1]) << 24) | // r
				(parse255(match[2]) << 16) | // g
					(parse255(match[3]) << 8) |
					0x000000ff) >>> // a
				0
			);
		}
	}

	if (matchers.rgba) {
		if ((match = matchers.rgba.exec(color))) {
			return (
				// b
				((parse255(match[1]) << 24) | // r
				(parse255(match[2]) << 16) | // g
					(parse255(match[3]) << 8) |
					parse1(match[4])) >>> // a
				0
			);
		}
	}

	if (matchers.hex3) {
		if ((match = matchers.hex3.exec(color))) {
			return (
				Number.parseInt(
					match[1] +
					match[1] + // r
					match[2] +
					match[2] + // g
					match[3] +
					match[3] + // b
						'ff', // a
					16
				) >>> 0
			);
		}
	}

	// https://drafts.csswg.org/css-color-4/#hex-notation
	if (matchers.hex8) {
		if ((match = matchers.hex8.exec(color))) {
			return Number.parseInt(match[1], 16) >>> 0;
		}
	}

	if (matchers.hex4) {
		if ((match = matchers.hex4.exec(color))) {
			return (
				Number.parseInt(
					match[1] +
					match[1] + // r
					match[2] +
					match[2] + // g
					match[3] +
					match[3] + // b
						match[4] +
						match[4], // a
					16
				) >>> 0
			);
		}
	}

	if (matchers.hsl) {
		if ((match = matchers.hsl.exec(color))) {
			return (
				(hslToRgb(
					parse360(match[1]), // h
					parsePercentage(match[2]), // s
					parsePercentage(match[3]) // l
				) |
					0x000000ff) >>> // a
				0
			);
		}
	}

	if (matchers.hsla) {
		if ((match = matchers.hsla.exec(color))) {
			return (
				(hslToRgb(
					parse360(match[1]), // h
					parsePercentage(match[2]), // s
					parsePercentage(match[3]) // l
				) |
					parse1(match[4])) >>> // a
				0
			);
		}
	}

	return null;
}

export const opacity = (c: number): number => {
	return ((c >> 24) & 255) / 255;
};

export const red = (c: number): number => {
	return (c >> 16) & 255;
};

export const green = (c: number): number => {
	return (c >> 8) & 255;
};

export const blue = (c: number): number => {
	return c & 255;
};

export const rgbaColor = (
	r: number,
	g: number,
	b: number,
	alpha = 1
): number | string => {
	const a = Math.round(alpha * 255);
	const c =
		a * (1 << 24) +
		Math.round(r) * (1 << 16) +
		Math.round(g) * (1 << 8) +
		Math.round(b);

	return c;
};

/* accepts parameters
 * r  Object = {r:x, g:y, b:z}
 * OR
 * r, g, b
 * 0 <= r, g, b <= 255
 * returns 0 <= h, s, v <= 1
 */

/* eslint no-redeclare: 0 */
function RGBtoHSV(rgb: RBG): HSV;
function RGBtoHSV(r: number, g: number, b: number): HSV;
function RGBtoHSV(r: any, g?: any, b?: any): HSV {
	/* eslint-disable */
	if (arguments.length === 1) {
		g = r.g;
		b = r.b;
		r = r.r;
	}
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const d = max - min;
	const s = max === 0 ? 0 : d / max;
	const v = max / 255;

	let h;

	switch (max) {
		default:
		/* fallthrough */
		case min:
			h = 0;
			break;
		case r:
			h = g - b + d * (g < b ? 6 : 0);
			h /= 6 * d;
			break;
		case g:
			h = b - r + d * 2;
			h /= 6 * d;
			break;
		case b:
			h = r - g + d * 4;
			h /= 6 * d;
			break;
	}

	return {
		h: h,
		s: s,
		v: v,
	};
	/* eslint-enable */
}

/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR
 * h, s, v
 * 0 <= h, s, v <= 1
 * returns 0 <= r, g, b <= 255
 */
function HSVtoRGB(hsv: HSV): RBG;
function HSVtoRGB(h: number, s: number, v: number): RBG;
function HSVtoRGB(h: any, s?: any, v?: any) {
	/* eslint-disable */
	var r, g, b, i, f, p, q, t;
	if (arguments.length === 1) {
		s = h.s;
		v = h.v;
		h = h.h;
	}
	i = Math.floor(h * 6);
	f = h * 6 - i;
	p = v * (1 - s);
	q = v * (1 - f * s);
	t = v * (1 - (1 - f) * s);
	switch (i % 6) {
		case 0:
			(r = v), (g = t), (b = p);
			break;
		case 1:
			(r = q), (g = v), (b = p);
			break;
		case 2:
			(r = p), (g = v), (b = t);
			break;
		case 3:
			(r = p), (g = q), (b = v);
			break;
		case 4:
			(r = t), (g = p), (b = v);
			break;
		case 5:
			(r = v), (g = p), (b = q);
			break;
	}
	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255),
	};
	/* eslint-enable */
}

export const hsvToColor = (
	h: number,
	s: number,
	v: number
): number | string => {
	const {r, g, b} = HSVtoRGB(h, s, v);
	return rgbaColor(r, g, b);
};

export function processColorInitially(
	color: unknown
): number | null | undefined {
	if (color === null || color === undefined || typeof color === 'number') {
		return color;
	}

	let normalizedColor = normalizeColor(color);

	if (normalizedColor === null || normalizedColor === undefined) {
		return undefined;
	}

	if (typeof normalizedColor !== 'number') {
		return null;
	}

	normalizedColor = ((normalizedColor << 24) | (normalizedColor >>> 8)) >>> 0; // argb
	return normalizedColor;
}

export function isColor(value: unknown): boolean {
	if (typeof value !== 'string') {
		return false;
	}
	return processColorInitially(value) != null;
}

export function processColor(color: unknown): number | null | undefined {
	const normalizedColor = processColorInitially(color);
	if (normalizedColor === null || normalizedColor === undefined) {
		return undefined;
	}

	if (typeof normalizedColor !== 'number') {
		return null;
	}

	return normalizedColor;
}

export function convertToHSVA(
	color: unknown
): [number, number, number, number] {
	const processedColor = processColorInitially(color)!; // argb;
	const a = (processedColor >>> 24) / 255;
	const r = (processedColor << 8) >>> 24;
	const g = (processedColor << 16) >>> 24;
	const b = (processedColor << 24) >>> 24;
	const {h, s, v} = RGBtoHSV(r, g, b);
	return [h, s, v, a];
}

export function toRGBA(HSVA: [number, number, number, number]): string {
	const {r, g, b} = HSVtoRGB(HSVA[0], HSVA[1], HSVA[2]);
	return `rgba(${r}, ${g}, ${b}, ${HSVA[3]})`;
}

const interpolateColorsHSV = (
	value: number,
	inputRange: readonly number[],
	colors: readonly number[]
) => {
	const colorsAsHSV = colors.map((c) => RGBtoHSV(c as any));
	const h = interpolate(
		value,
		inputRange,
		colorsAsHSV.map((c) => c.h),
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}
	);
	const s = interpolate(
		value,
		inputRange,
		colorsAsHSV.map((c) => c.s),
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}
	);
	const v = interpolate(
		value,
		inputRange,
		colorsAsHSV.map((c) => c.v),
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}
	);
	return hsvToColor(h, s, v);
};

const interpolateColorsRGB = (
	value: number,
	inputRange: readonly number[],
	colors: readonly number[]
) => {
	const r = Math.round(
		interpolate(
			value,
			inputRange,
			colors.map((c) => red(c)),
			{
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			}
		)
	);
	const g = Math.round(
		interpolate(
			value,
			inputRange,
			colors.map((c) => green(c)),
			{
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			}
		)
	);
	const b = Math.round(
		interpolate(
			value,
			inputRange,
			colors.map((c) => blue(c)),
			{
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			}
		)
	);
	const a = interpolate(
		value,
		inputRange,
		colors.map((c) => opacity(c)),
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}
	);
	return rgbaColor(r, g, b, a);
};

export const interpolateColors = (
	value: number,
	inputRange: readonly number[],
	outputRange: readonly (string | number)[],
	colorSpace: 'RGB' | 'HSV' = 'RGB'
): string | number => {
	const processedOutputRange = outputRange.map((c) => processColor(c)!);
	if (colorSpace === 'HSV') {
		return interpolateColorsHSV(value, inputRange, processedOutputRange);
	}
	if (colorSpace === 'RGB') {
		return interpolateColorsRGB(value, inputRange, processedOutputRange);
	}
	throw new Error(
		`invalid color space provided: ${colorSpace}. Supported values are: ['RGB', 'HSV']`
	);
};
