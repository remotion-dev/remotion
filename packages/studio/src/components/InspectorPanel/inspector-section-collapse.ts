import type {SchemaFieldGroup} from '@remotion/studio-shared';
import {Internals, type InteractivitySchema} from 'remotion';
import {parseAnyColor} from '../../helpers/color-conversion';

export type SmartCollapsibleInspectorGroup = Extract<
	SchemaFieldGroup,
	'background' | 'border' | 'border-radius' | 'crop' | 'layout'
>;

export type InspectorSectionActivity = 'active' | 'inactive' | 'unknown';

type InspectorSectionPropStatus =
	| {readonly status: 'static'; readonly codeValue: unknown}
	| {readonly status: 'computed' | 'keyframed'};

const BORDER_KEYS = [
	'style.borderWidth',
	'style.borderStyle',
	'style.borderColor',
] as const;

const BORDER_RADIUS_SHORTHAND_KEY = 'style.borderRadius';
const BORDER_RADIUS_LONGHAND_KEYS = [
	'style.borderTopLeftRadius',
	'style.borderTopRightRadius',
	'style.borderBottomRightRadius',
	'style.borderBottomLeftRadius',
] as const;

const CROP_KEYS = ['cropLeft', 'cropRight', 'cropTop', 'cropBottom'] as const;
const LAYOUT_KEYS = ['layout', 'premountFor'] as const;

const BACKGROUND_COLOR_KEY = 'style.backgroundColor';

export const isSmartCollapsibleInspectorGroup = (
	group: SchemaFieldGroup,
): group is SmartCollapsibleInspectorGroup => {
	return (
		group === 'background' ||
		group === 'border' ||
		group === 'border-radius' ||
		group === 'crop' ||
		group === 'layout'
	);
};

const getStaticValue = ({
	key,
	propStatuses,
}: {
	readonly key: string;
	readonly propStatuses:
		| Readonly<Record<string, InspectorSectionPropStatus>>
		| undefined;
}):
	| {readonly found: true; readonly value: unknown}
	| {readonly found: false} => {
	const status = propStatuses?.[key];
	if (status?.status !== 'static') {
		return {found: false};
	}

	return {found: true, value: status.codeValue};
};

const isZeroOrUndefined = (value: unknown): boolean => {
	return value === undefined || value === 0;
};

const isTransparentOrUndefined = (value: unknown): boolean => {
	if (value === undefined) {
		return true;
	}

	if (typeof value !== 'string') {
		return false;
	}

	return parseAnyColor(value).a === 0;
};

const hasOnlyStaticZeroValues = ({
	keys,
	propStatuses,
}: {
	readonly keys: readonly string[];
	readonly propStatuses:
		| Readonly<Record<string, InspectorSectionPropStatus>>
		| undefined;
}): boolean => {
	for (const key of keys) {
		const result = getStaticValue({key, propStatuses});
		if (!result.found || !isZeroOrUndefined(result.value)) {
			return false;
		}
	}

	return true;
};

const isBorderInactive = (
	propStatuses:
		| Readonly<Record<string, InspectorSectionPropStatus>>
		| undefined,
): boolean => {
	const [width, style, color] = BORDER_KEYS.map((key) =>
		getStaticValue({key, propStatuses}),
	);

	if (!width.found || !style.found || !color.found) {
		return false;
	}

	if (
		style.value === undefined ||
		style.value === 'none' ||
		style.value === 'hidden'
	) {
		return true;
	}

	if (width.value === 0) {
		return true;
	}

	return isTransparentOrUndefined(color.value) && color.value !== undefined;
};

const isBorderRadiusInactive = (
	propStatuses:
		| Readonly<Record<string, InspectorSectionPropStatus>>
		| undefined,
): boolean => {
	const shorthandStatus = propStatuses?.[BORDER_RADIUS_SHORTHAND_KEY];
	if (shorthandStatus && shorthandStatus.status !== 'static') {
		return false;
	}

	if (shorthandStatus?.codeValue !== undefined) {
		return shorthandStatus.codeValue === 0;
	}

	return hasOnlyStaticZeroValues({
		keys: BORDER_RADIUS_LONGHAND_KEYS,
		propStatuses,
	});
};

const isLayoutInactive = ({
	propStatuses,
	schema,
}: {
	readonly propStatuses:
		| Readonly<Record<string, InspectorSectionPropStatus>>
		| undefined;
	readonly schema: InteractivitySchema | undefined;
}): boolean => {
	if (!schema) {
		return false;
	}

	const flatSchema = Internals.getFlatSchemaWithAllKeys(schema);
	const layoutKeys = LAYOUT_KEYS.filter((key) => flatSchema[key] !== undefined);
	if (layoutKeys.length === 0) {
		return false;
	}

	return layoutKeys.every((key) => {
		const result = getStaticValue({key, propStatuses});
		const field = flatSchema[key];
		if (!result.found || !field || field.type === 'hidden') {
			return false;
		}

		const effectiveValue =
			result.value === undefined ? field.default : result.value;
		return Object.is(effectiveValue, field.default);
	});
};

export const isInspectorSectionEffectivelyInactive = ({
	group,
	propStatuses,
	schema,
}: {
	readonly group: SmartCollapsibleInspectorGroup;
	readonly propStatuses:
		| Readonly<Record<string, InspectorSectionPropStatus>>
		| undefined;
	readonly schema?: InteractivitySchema;
}): boolean => {
	if (group === 'layout') {
		return isLayoutInactive({propStatuses, schema});
	}

	if (group === 'border') {
		return isBorderInactive(propStatuses);
	}

	if (group === 'border-radius') {
		return isBorderRadiusInactive(propStatuses);
	}

	if (group === 'crop') {
		return hasOnlyStaticZeroValues({keys: CROP_KEYS, propStatuses});
	}

	const backgroundColor = getStaticValue({
		key: BACKGROUND_COLOR_KEY,
		propStatuses,
	});
	return (
		backgroundColor.found && isTransparentOrUndefined(backgroundColor.value)
	);
};

const hasOwnStatus = ({
	key,
	propStatuses,
}: {
	readonly key: string;
	readonly propStatuses:
		| Readonly<Record<string, InspectorSectionPropStatus>>
		| undefined;
}): boolean => {
	return (
		propStatuses !== undefined &&
		Object.prototype.hasOwnProperty.call(propStatuses, key)
	);
};

const hasEveryStatus = ({
	keys,
	propStatuses,
}: {
	readonly keys: readonly string[];
	readonly propStatuses:
		| Readonly<Record<string, InspectorSectionPropStatus>>
		| undefined;
}): boolean => {
	return keys.every((key) => hasOwnStatus({key, propStatuses}));
};

export const getInspectorSectionActivity = ({
	group,
	propStatuses,
	schema,
}: {
	readonly group: SmartCollapsibleInspectorGroup;
	readonly propStatuses:
		| Readonly<Record<string, InspectorSectionPropStatus>>
		| undefined;
	readonly schema?: InteractivitySchema;
}): InspectorSectionActivity => {
	let resolved = false;
	if (group === 'border') {
		resolved = hasEveryStatus({keys: BORDER_KEYS, propStatuses});
	} else if (group === 'border-radius') {
		const shorthandStatus = propStatuses?.[BORDER_RADIUS_SHORTHAND_KEY];
		resolved =
			(shorthandStatus !== undefined &&
				(shorthandStatus.status !== 'static' ||
					shorthandStatus.codeValue !== undefined)) ||
			hasEveryStatus({keys: BORDER_RADIUS_LONGHAND_KEYS, propStatuses});
	} else if (group === 'crop') {
		resolved = hasEveryStatus({keys: CROP_KEYS, propStatuses});
	} else if (group === 'layout') {
		const flatSchema = schema
			? Internals.getFlatSchemaWithAllKeys(schema)
			: undefined;
		const layoutKeys = LAYOUT_KEYS.filter(
			(key) => flatSchema?.[key] !== undefined,
		);
		resolved =
			layoutKeys.length > 0 && hasEveryStatus({keys: layoutKeys, propStatuses});
	} else {
		resolved = hasOwnStatus({key: BACKGROUND_COLOR_KEY, propStatuses});
	}

	if (!resolved) {
		return 'unknown';
	}

	return isInspectorSectionEffectivelyInactive({group, propStatuses, schema})
		? 'inactive'
		: 'active';
};
