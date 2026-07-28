import {parseBackgroundShorthand} from './parse-background-shorthand';
import {parseBorderShorthand} from './parse-border-shorthand';

type ParsedCssShorthand = Readonly<Record<string, string | number>>;

export type CssShorthandProperty = {
	readonly parentKey: string;
	readonly shorthand: string;
	readonly longhands: readonly string[];
	readonly parse: (value: string) => ParsedCssShorthand | null;
	readonly isUnsupportedProperty: (propertyName: string) => boolean;
};

const borderSidePropertyRegex =
	/^border(?:Top|Right|Bottom|Left)(?:Width|Style|Color)?$/;

const borderShorthand = {
	parentKey: 'style',
	shorthand: 'border',
	longhands: ['borderWidth', 'borderStyle', 'borderColor'],
	parse: parseBorderShorthand,
	isUnsupportedProperty: (propertyName: string) =>
		borderSidePropertyRegex.test(propertyName),
} as const satisfies CssShorthandProperty;

const backgroundShorthand = {
	parentKey: 'style',
	shorthand: 'background',
	longhands: [
		'backgroundColor',
		'backgroundImage',
		'backgroundPosition',
		'backgroundSize',
		'backgroundRepeat',
		'backgroundOrigin',
		'backgroundClip',
		'backgroundAttachment',
	],
	parse: parseBackgroundShorthand,
	isUnsupportedProperty: () => false,
} as const satisfies CssShorthandProperty;

export const cssShorthandProperties = [
	backgroundShorthand,
	borderShorthand,
] as const satisfies readonly CssShorthandProperty[];

export const getCssShorthandForLonghand = ({
	parentKey,
	longhand,
}: {
	parentKey: string;
	longhand: string;
}): CssShorthandProperty | null => {
	return (
		cssShorthandProperties.find(
			(property) =>
				property.parentKey === parentKey &&
				(property.longhands as readonly string[]).includes(longhand),
		) ?? null
	);
};

export const getCssShorthandsForUpdates = (
	updateKeys: readonly string[],
): CssShorthandProperty[] => {
	return cssShorthandProperties.filter((property) =>
		updateKeys.some((key) =>
			property.longhands.some(
				(longhand) => key === `${property.parentKey}.${longhand}`,
			),
		),
	);
};
