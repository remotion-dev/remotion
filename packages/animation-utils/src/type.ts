import type {breakDownValueIntoUnitNumberAndFunctions} from './transformation-helpers/interpolate-styles/utils';
import type {
	matrix,
	matrix3d,
	perspective,
	rotate,
	rotate3d,
	rotateX,
	rotateY,
	rotateZ,
	scale,
	scale3d,
	scaleX,
	scaleY,
	scaleZ,
	skew,
	skewX,
	skewY,
	translate,
	translate3d,
	translateX,
	translateY,
	translateZ,
} from './transformation-helpers/make-transform';

export const lengthUnits = [
	'px',
	'em',
	'rem',
	'pt',
	'cap',
	'ch',
	'ex',
	'ic',
	'lh',
	'rlh',
	'vmax',
	'vmin',
	'vb',
	'vi',
	'cqw',
	'vh',
	'vw',
	'cqh',
	'cqi',
	'cqb',
	'cqmin',
	'cqmax',
	'cm',
	'mm',
	'Q',
	'in',
	'pc',
] as const;
export const angleUnits = ['rad', 'deg', 'grad', 'turn'] as const;

export const lengthPercentageUnits = ['%', ...lengthUnits] as const;

type LengthUnit = (typeof lengthUnits)[number];
type AngleUnit = (typeof angleUnits)[number];
type LengthPercentageUnit = (typeof lengthPercentageUnits)[number];

export type LengthUnitString = `${number}${LengthUnit}`;
export type LengthPercentageUnitString = `${number}${LengthPercentageUnit}`;
export type AngleUnitString = `${number}${AngleUnit}`;

type TransformFunctionReturnType = ReturnType<
	| typeof matrix
	| typeof matrix3d
	| typeof perspective
	| typeof rotate
	| typeof rotate3d
	| typeof rotateX
	| typeof rotateY
	| typeof rotateZ
	| typeof scale
	| typeof scale3d
	| typeof scaleX
	| typeof scaleY
	| typeof scaleZ
	| typeof skew
	| typeof skewX
	| typeof skewY
	| typeof translate
	| typeof translate3d
	| typeof translateX
	| typeof translateY
	| typeof translateZ
>;

type MatcherType = RegExp | undefined;

type ColorMatchers = {
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

type Style = React.CSSProperties;
type CSSPropertiesKey = keyof Style;
type CSSPropertiesValue = Style[CSSPropertiesKey];

type UnitNumberAndFunctions = ReturnType<
	typeof breakDownValueIntoUnitNumberAndFunctions
>;

type UnitNumberAndFunction = UnitNumberAndFunctions[0];

export type {
	AngleUnit,
	ColorMatchers,
	CSSPropertiesKey,
	CSSPropertiesValue,
	LengthPercentageUnit,
	LengthUnit,
	Style,
	TransformFunctionReturnType,
	UnitNumberAndFunction,
};
