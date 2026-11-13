import type {FontReadinessStyle} from './font-readiness';

type Descriptors = {
	weight: string | null;
	style: string | null;
	stretch: string | null;
	unicodeRange: string | null;
};
type Interval = readonly [number, number];
const widths: Record<string, number> = {
	'ultra-condensed': 50,
	'extra-condensed': 62.5,
	condensed: 75,
	'semi-condensed': 87.5,
	normal: 100,
	'semi-expanded': 112.5,
	expanded: 125,
	'extra-expanded': 150,
	'ultra-expanded': 200,
};
const interval = (
	value: string | null,
	kind: 'weight' | 'stretch',
): Interval | null => {
	const input = (value ?? 'normal').trim().toLowerCase();
	const parts = input.split(/\s+/);
	if (
		parts.length > 2 ||
		(parts.length === 2 &&
			parts.some(
				(part) =>
					!(kind === 'weight' ? /^\d+(?:\.\d+)?$/ : /^\d+(?:\.\d+)?%$/).test(
						part,
					),
			))
	)
		return null;
	const values = parts.map((part) => {
		if (kind === 'stretch') {
			if (Object.hasOwn(widths, part)) return widths[part]!;
			return /^\d+(?:\.\d+)?%$/.test(part) ? Number(part.slice(0, -1)) : NaN;
		}

		if (part === 'normal') return 400;
		if (part === 'bold') return 700;
		return /^\d+(?:\.\d+)?$/.test(part) ? Number(part) : NaN;
	});
	const min = values[0]!;
	const max = values[1] ?? min;
	return Number.isFinite(min) &&
		Number.isFinite(max) &&
		min > 0 &&
		max >= min &&
		max <= 1000
		? [min, max]
		: null;
};

const compare = (left: readonly number[], right: readonly number[]) => {
	for (let i = 0; i < left.length; i++) {
		if (left[i] !== right[i]) return left[i]! - right[i]!;
	}

	return 0;
};

const rank = (range: Interval, query: number, kind: 'weight' | 'stretch') => {
	const pointRank = (point: number): readonly number[] => {
		if (kind === 'weight' && query >= 400 && query <= 500) {
			if (point >= query && point <= 500) return [0, point - query];
			if (point < query) return [1, query - point];
			return [2, point - 500];
		}

		const preferBelow = kind === 'stretch' ? query <= 100 : query < 400;
		return preferBelow
			? point <= query
				? [0, query - point]
				: [1, point - query]
			: point >= query
				? [0, point - query]
				: [1, query - point];
	};

	const clamp = (point: number) =>
		Math.max(range[0], Math.min(range[1], point));
	return [range[0], range[1], clamp(query), clamp(500)]
		.map(pointRank)
		.sort(compare)[0]!;
};

const ranges = (value: string | null): Interval[] | null => {
	if (value === null) return [[0, 0x10ffff]];
	const result: Interval[] = [];
	for (const part of value.split(',')) {
		const match = /^U\+([0-9A-F?]{1,6})(?:-([0-9A-F]{1,6}))?$/i.exec(
			part.trim(),
		);
		if (
			!match ||
			(match[2] && match[1]!.includes('?')) ||
			!/^[0-9A-F]*\?*$/i.test(match[1]!)
		)
			return null;
		const min = Number.parseInt(match[1]!.replace(/\?/g, '0'), 16);
		const max = Number.parseInt(
			(match[2] ?? match[1]!).replace(/\?/g, 'F'),
			16,
		);
		if (min > max || max > 0x10ffff) return null;
		result.push([min, max]);
	}

	return result;
};

// A pre-FontFace SDK request cannot be tested with FontFaceSet.check. Exclude it
// only when an already loaded, text-covering face strictly dominates its CSS
// descriptor rank, or the same descriptor group gains no characters in use.
// Angle-dependent oblique matching and equal ranks remain possible winners.
export const pendingFontMayAffectSample = (
	pending: Descriptors,
	loaded: readonly Descriptors[],
	style: FontReadinessStyle,
	text: string,
): boolean => {
	const queryWidth = interval(style.fontStretch, 'stretch');
	const queryWeight = interval(style.fontWeight, 'weight');
	const queryStyle = style.fontStyle?.trim().toLowerCase();
	const pendingWidth = interval(pending.stretch, 'stretch');
	const pendingWeight = interval(pending.weight, 'weight');
	const pendingStyle = (pending.style ?? 'normal').trim().toLowerCase();
	const pendingRanges = ranges(pending.unicodeRange);
	if (
		!queryWidth ||
		!queryWeight ||
		queryWidth[0] !== queryWidth[1] ||
		queryWeight[0] !== queryWeight[1] ||
		!pendingWidth ||
		!pendingWeight ||
		!pendingRanges ||
		!['normal', 'italic'].includes(queryStyle) ||
		!['normal', 'italic'].includes(pendingStyle)
	)
		return true;
	const points = Array.from(text, (character) => character.codePointAt(0)!);
	const hasPoint = (set: Interval[], point: number) =>
		set.some(([min, max]) => point >= min && point <= max);
	const pendingRank = [
		...rank(pendingWidth, queryWidth[0], 'stretch'),
		pendingStyle === queryStyle ? 0 : 1,
		...rank(pendingWeight, queryWeight[0], 'weight'),
	];
	return !loaded.some((face) => {
		const width = interval(face.stretch, 'stretch');
		const weight = interval(face.weight, 'weight');
		const faceStyle = (face.style ?? 'normal').trim().toLowerCase();
		const coverage = ranges(face.unicodeRange);
		if (
			!width ||
			!weight ||
			!coverage ||
			!['normal', 'italic'].includes(faceStyle) ||
			!points.every((point) => hasPoint(coverage, point))
		)
			return false;
		const faceRank = [
			...rank(width, queryWidth[0], 'stretch'),
			faceStyle === queryStyle ? 0 : 1,
			...rank(weight, queryWeight[0], 'weight'),
		];
		if (compare(faceRank, pendingRank) < 0) return true;
		const sameDescriptors =
			faceStyle === pendingStyle &&
			compare(width, pendingWidth) === 0 &&
			compare(weight, pendingWeight) === 0;
		return (
			sameDescriptors &&
			points.every((point) => !hasPoint(pendingRanges, point))
		);
	});
};
