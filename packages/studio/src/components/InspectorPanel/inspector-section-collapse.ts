import type {SchemaFieldGroup} from '@remotion/studio-shared';
import {parseAnyColor} from '../../helpers/color-conversion';

export type SmartCollapsibleInspectorGroup = Extract<
	SchemaFieldGroup,
	'background' | 'border' | 'border-radius' | 'crop'
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

const BACKGROUND_COLOR_KEY = 'style.backgroundColor';

export const isSmartCollapsibleInspectorGroup = (
	group: SchemaFieldGroup,
): group is SmartCollapsibleInspectorGroup => {
	return (
		group === 'background' ||
		group === 'border' ||
		group === 'border-radius' ||
		group === 'crop'
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

export const isInspectorSectionEffectivelyInactive = ({
	group,
	propStatuses,
}: {
	readonly group: SmartCollapsibleInspectorGroup;
	readonly propStatuses:
		| Readonly<Record<string, InspectorSectionPropStatus>>
		| undefined;
}): boolean => {
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
}: {
	readonly group: SmartCollapsibleInspectorGroup;
	readonly propStatuses:
		| Readonly<Record<string, InspectorSectionPropStatus>>
		| undefined;
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
	} else {
		resolved = hasOwnStatus({key: BACKGROUND_COLOR_KEY, propStatuses});
	}

	if (!resolved) {
		return 'unknown';
	}

	return isInspectorSectionEffectivelyInactive({group, propStatuses})
		? 'inactive'
		: 'active';
};
