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

export const cssShorthandProperties = [
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
				property.longhands.includes(
					longhand as (typeof property.longhands)[number],
				),
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
