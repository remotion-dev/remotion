export const BORDER_RADIUS_SHORTHAND_KEY = 'style.borderRadius';
export const BORDER_RADIUS_LONGHAND_KEYS = [
	'style.borderTopLeftRadius',
	'style.borderTopRightRadius',
	'style.borderBottomRightRadius',
	'style.borderBottomLeftRadius',
] as const;

const STYLE_PROPERTY_LONGHANDS = new Map<string, readonly string[]>([
	[BORDER_RADIUS_SHORTHAND_KEY, BORDER_RADIUS_LONGHAND_KEYS],
]);

export const getStylePropertyLonghandKeys = (
	fieldKey: string,
): readonly string[] => STYLE_PROPERTY_LONGHANDS.get(fieldKey) ?? [];
