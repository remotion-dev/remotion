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
import type {breakDownValueIntoUnitNumberAndFunctions} from './transformation-helpers/use-interpolate-styles/utils';

type TransformFunction = () => string;
type LengthUnit =
	| 'cap'
	| 'ch'
	| 'em'
	| 'ex'
	| 'ic'
	| 'lh'
	| 'rem'
	| 'rlh'
	| 'vh'
	| 'vw'
	| 'vmax'
	| 'vmin'
	| 'vb'
	| 'vi'
	| 'cqw'
	| 'cqh'
	| 'cqi'
	| 'cqb'
	| 'cqmin'
	| 'cqmax'
	| 'px'
	| 'cm'
	| 'mm'
	| 'Q'
	| 'in'
	| 'pc'
	| 'pt';

type LengthPercentageUnit = LengthUnit | '%';

type AngleUnit = 'deg' | 'grad' | 'rad' | 'turn';

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

type InterpolateStylesParams =
	| {
			inputRangeInFrames: number[];
			inputRangeInSeconds?: number[];
			outputStyles: Style[];
	  }
	| {
			inputRangeInFrames?: number[];
			inputRangeInSeconds: number[];
			outputStyles: Style[];
	  };

type UnitNumberAndFunctions = ReturnType<
	typeof breakDownValueIntoUnitNumberAndFunctions
>;

type UnitNumberAndFunction = UnitNumberAndFunctions[0];

export type {
	TransformFunction,
	LengthUnit,
	LengthPercentageUnit,
	AngleUnit,
	TransformFunctionReturnType,
	ColorMatchers,
	Style,
	CSSPropertiesKey,
	CSSPropertiesValue,
	InterpolateStylesParams,
	UnitNumberAndFunction,
};
